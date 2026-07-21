/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Send, Sparkles, User, Bot, Loader2, BookOpen, Activity, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function AskLoopDashboard() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "What are the most common complaints about billing?",
    "How has sentiment for the Dashboard changed this week?",
    "Summarize the recent feature requests for export functionality."
  ]);

  const handleSubmit = async (overrideQuery?: string) => {
    const text = overrideQuery || query;
    if (!text.trim() || isLoading) return;

    const userMessage = { id: Date.now(), role: "USER", content: text };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text })
      });
      const data = await response.json();
      
      if (data.status === "success") {
        setMessages(prev => [...prev, data.data.message]);
        setSuggestedQuestions(data.data.suggestedFollowUps || []);
      } else {
        throw new Error(data.error?.message || "Failed to fetch answer");
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now(), role: "SYSTEM", content: "Error: Failed to connect to Ask LOOP." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Main Chat Area */}
      <Card className="flex flex-1 flex-col shadow-panel">
        <CardHeader className="border-b bg-muted/50 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <div>
              <CardTitle>Ask LOOP</CardTitle>
              <CardDescription>Enterprise Knowledge Intelligence Platform</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground mt-20">
                  <BookOpen className="mb-4 size-12 opacity-20" />
                  <p className="text-lg font-medium text-foreground">How can I help you analyze your data?</p>
                  <p className="mt-2 max-w-sm">Ask questions about your feedback, themes, and analytics. All answers are grounded in your enterprise data.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 ${msg.role === "USER" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${msg.role === "USER" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {msg.role === "USER" ? <User className="size-4" /> : <Bot className="size-4" />}
                    </div>
                    <div className={`flex max-w-[80%] flex-col gap-2 ${msg.role === "USER" ? "items-end" : "items-start"}`}>
                      {msg.role === "ASSISTANT" && msg.metadata && (
                        <div className="flex flex-wrap gap-2 mb-1 px-1">
                          {msg.metadata.answerConfidence !== undefined && (
                            <Badge variant={msg.metadata.answerConfidence > 0.8 ? "secondary" : "outline"} className="text-[10px]">
                              {msg.metadata.answerConfidence > 0.8 ? "High Confidence" : "Low Confidence"}
                            </Badge>
                          )}
                          {msg.metadata.processingTimeMs && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Activity className="size-3" /> {msg.metadata.processingTimeMs}ms
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className={`rounded-lg p-4 ${msg.role === "USER" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground border"}`}>
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      </div>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {msg.citations.map((c: any, i: number) => (
                            <Badge key={i} variant="outline" className="text-[10px] bg-background/50 cursor-pointer hover:bg-muted transition-colors">
                              [{i + 1}] {c.title.substring(0, 30)}{c.title.length > 30 ? '...' : ''}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">Searching knowledge base...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="border-t p-4 bg-background">
            {suggestedQuestions.length > 0 && messages.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs rounded-full bg-muted/50"
                    onClick={() => handleSubmit(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            )}
            <div className="relative">
              <Textarea
                placeholder="Ask about your feedback or themes..."
                className="min-h-[60px] resize-none pr-12 focus-visible:ring-1"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuery(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                size="icon"
                className="absolute bottom-2 right-2 size-8 rounded-md"
                disabled={!query.trim() || isLoading}
                onClick={() => handleSubmit()}
              >
                <Send className="size-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Ask LOOP uses AI to analyze your workspace data. Answers are generated from retrieved context only.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Right Panel for Citations / Context (Desktop only for now) */}
      <div className="hidden w-[350px] flex-col gap-4 lg:flex">
        <Card className="flex-1 shadow-panel">
          <CardHeader>
            <CardTitle className="text-sm">Knowledge Sources</CardTitle>
            <CardDescription className="text-xs">Context retrieved for the latest answer</CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length > 0 && messages[messages.length - 1].role === "ASSISTANT" ? (
              <div className="space-y-4">
                {messages[messages.length - 1].trace && (
                  <div className="rounded-lg bg-primary/5 p-3 text-xs border border-primary/20 mb-4">
                    <div className="flex items-center gap-2 font-semibold text-primary mb-1">
                      <Activity className="size-3" /> Retrieval Trace
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground mt-2">
                      <div><span className="font-medium">Intent:</span> {messages[messages.length - 1].trace.intent}</div>
                      <div><span className="font-medium">Strategy:</span> {messages[messages.length - 1].trace.retrievalStrategy}</div>
                    </div>
                  </div>
                )}
                <Accordion type="single" collapsible className="w-full">
                  {messages[messages.length - 1].citations?.map((c: any, i: number) => (
                    <AccordionItem key={i} value={`item-${i}`} className="border-b-0 mb-2 rounded-lg border bg-muted/30 px-1">
                      <AccordionTrigger className="hover:no-underline py-3 px-2 text-sm font-medium">
                        <div className="flex items-center justify-between w-full pr-4 text-left">
                          <span className="truncate mr-2">[{i + 1}] {c.title}</span>
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {c.relevanceScore ? (c.relevanceScore * 100).toFixed(0) + '%' : 'N/A'}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-3 pt-0">
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground bg-background rounded p-2 border">
                            {c.snippet}
                          </p>
                          {(c.sentiment || c.channel || c.theme) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {c.channel && <Badge variant="outline" className="text-[9px] uppercase">{c.channel}</Badge>}
                              {c.sentiment && (
                                <Badge variant="outline" className="text-[9px] uppercase">
                                  {c.sentiment === "POSITIVE" ? "🟢 Pos" : c.sentiment === "NEGATIVE" ? "🔴 Neg" : "⚪ Neu"}
                                </Badge>
                              )}
                              {c.theme && <Badge variant="outline" className="text-[9px] bg-primary/10">{c.theme}</Badge>}
                            </div>
                          )}
                          {c.selectionReason && (
                            <div className="flex items-start gap-1.5 mt-2 text-[10px] text-muted-foreground italic">
                              <Info className="size-3 mt-0.5 shrink-0" />
                              <span>{c.selectionReason}</span>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {(!messages[messages.length - 1].citations || messages[messages.length - 1].citations.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
                    <AlertTriangle className="size-8 text-yellow-500/50" />
                    <p className="text-xs">No sources retrieved for this answer.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <p className="text-sm text-muted-foreground">Ask a question to see retrieved sources.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
