"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"

interface Message {
  id: string
  sender: "me" | "other"
  text: string
  timestamp: string
}

interface ChatModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacto: {
    nombre: string
    foto: string
  }
}

export function ChatModal({ open, onOpenChange, contacto }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "other",
      text: "Hola! Vi que te interesa el viaje. ¿Tienes alguna pregunta?",
      timestamp: "10:30",
    },
    {
      id: "2",
      sender: "me",
      text: "Hola! Sí, ¿a qué hora exactamente sales?",
      timestamp: "10:32",
    },
    {
      id: "3",
      sender: "other",
      text: "Salgo a las 2:30 PM desde el estacionamiento del campus central.",
      timestamp: "10:33",
    },
  ])
  const [newMessage, setNewMessage] = useState("")

  const handleSend = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      sender: "me",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={contacto.foto || "/placeholder.svg"} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {contacto.nombre
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <DialogTitle className="text-lg">{contacto.nombre}</DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.sender === "me" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "me" ? "text-accent-foreground/70" : "text-muted-foreground/70"
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSend} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Recuerda mantener la comunicación respetuosa y dentro de la plataforma
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
