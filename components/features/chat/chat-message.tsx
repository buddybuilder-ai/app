"use client"

import { useState } from "react"
import { Bot, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Message, MessageContent } from "@/components/ui/message"
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/prompt-kit/reasoning"
import {
  ChainOfThought,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
  ChainOfThoughtContent,
  ChainOfThoughtItem,
} from "@/components/prompt-kit/chain-of-thought"
import type { ChatMessage as ChatMessageType } from "@/types/chat"
import { ChatActionButton } from "./chat-action-button"
import { ClarificationCard } from "./clarification-card"

interface ChatMessageProps {
  message: ChatMessageType
  onSubmitClarification?: (answers: Record<string, string>) => void
}

export function ChatMessage({ message, onSubmitClarification }: ChatMessageProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const isAssistant = message.role === "assistant"

  return (
    <Message
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col gap-2 px-0 md:px-6",
        isAssistant ? "items-start" : "items-end"
      )}
    >
      {isAssistant ? (
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              BuddyBuilder AI
            </span>
            {message.isThinking && (
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            )}
          </div>

          {/* Reasoning (simple collapsible) — only show when done thinking */}
          {!message.isThinking && message.reasoning && (
            <div className="px-2">
              <Reasoning>
                <ReasoningTrigger className="text-xs">
                  กระบวนการคิด
                </ReasoningTrigger>
                <ReasoningContent markdown contentClassName="text-xs">
                  {message.reasoning}
                </ReasoningContent>
              </Reasoning>
            </div>
          )}

          {/* Chain of Thought — shows progressively during thinking */}
          {message.reasoningSteps && message.reasoningSteps.length > 0 && (
            <div className="px-2">
              {message.isThinking ? (
                // During thinking: show steps open, last step has spinner
                <div className="space-y-0">
                  <ChainOfThought>
                    {message.reasoningSteps.map((step, i) => {
                      const isLastStep =
                        i === message.reasoningSteps!.length - 1

                      return (
                        <ChainOfThoughtStep key={i} defaultOpen>
                          <ChainOfThoughtTrigger
                            leftIcon={
                              isLastStep ? (
                                <Loader2 className="size-3 animate-spin text-primary" />
                              ) : (
                                <div className="size-2 rounded-full bg-primary" />
                              )
                            }
                            className={cn(
                              "animate-in fade-in duration-300",
                              isLastStep && "text-foreground"
                            )}
                          >
                            {step.label}
                          </ChainOfThoughtTrigger>
                          <ChainOfThoughtContent>
                            <ChainOfThoughtItem className="animate-in fade-in slide-in-from-top-1 whitespace-pre-wrap duration-300">
                              {step.content}
                            </ChainOfThoughtItem>
                          </ChainOfThoughtContent>
                        </ChainOfThoughtStep>
                      )
                    })}
                  </ChainOfThought>
                </div>
              ) : (
                // After thinking: collapsible chain of thought
                <ChainOfThought>
                  {message.reasoningSteps.map((step, i) => (
                    <ChainOfThoughtStep key={i}>
                      <ChainOfThoughtTrigger>{step.label}</ChainOfThoughtTrigger>
                      <ChainOfThoughtContent>
                        <ChainOfThoughtItem className="whitespace-pre-wrap">
                          {step.content}
                        </ChainOfThoughtItem>
                      </ChainOfThoughtContent>
                    </ChainOfThoughtStep>
                  ))}
                </ChainOfThought>
              )}
            </div>
          )}

          {/* Answer content — only show when not thinking */}
          {!message.isThinking && message.content && (
            <MessageContent
              className="text-foreground prose w-full flex-1 rounded-lg bg-transparent p-2 animate-in fade-in duration-500"
              markdown
            >
              {message.content}
            </MessageContent>
          )}

          {!message.isThinking && message.layoutAction && (
            <div className="px-2 animate-in fade-in duration-500">
              <ChatActionButton action={message.layoutAction} />
            </div>
          )}

          {!message.isThinking &&
            message.clarificationQuestions &&
            message.clarificationQuestions.length > 0 &&
            onSubmitClarification && (
              <div className="px-2 animate-in fade-in duration-500">
                <ClarificationCard
                  questions={message.clarificationQuestions}
                  onSubmit={onSubmitClarification}
                />
              </div>
            )}

          {!message.isThinking &&
            message.sources &&
            message.sources.length > 0 && (
              <div className="px-2 text-left">
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                >
                  {sourcesOpen ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {message.sources.length} แหล่งอ้างอิง
                </button>
                {sourcesOpen && (
                  <div className="mt-1 space-y-1">
                    {message.sources.map((source, i) => (
                      <div
                        key={i}
                        className="rounded border bg-background p-2 text-xs text-muted-foreground"
                      >
                        {source.content.slice(0, 200)}
                        {source.content.length > 200 && "..."}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>
      ) : (
        <MessageContent className="bg-primary text-primary-foreground max-w-[85%] sm:max-w-[75%]">
          {message.content}
        </MessageContent>
      )}
    </Message>
  )
}
