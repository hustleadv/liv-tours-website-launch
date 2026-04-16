import { useState, useCallback, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { Mic, Headphones, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface VoiceGuideProps {
  className?: string;
}

const VoiceGuide = ({ className }: VoiceGuideProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Track user speaking via VAD score (helps the user know when to pause)
  const handleVadScore = ({ vadScore }: { vadScore: number }) => {
    const speakingNow = vadScore > 0.45;
    setUserSpeaking(speakingNow);
    if (speakingNow) setIsProcessing(false);
  };

  const conversation = useConversation({
    onVadScore: handleVadScore,
    onConnect: () => {
      console.log("Connected to ElevenLabs agent");
      setIsConnecting(false);
    },
    onDisconnect: () => {
      console.log("Disconnected from agent");
      setTranscript("");
      setUserSpeaking(false);
      setIsProcessing(false);
    },
    onMessage: (message: unknown) => {
      console.log("Message received:", message);
      const msg = message as Record<string, unknown>;
      if (msg.type === "user_transcript") {
        const event = msg.user_transcription_event as Record<string, unknown>;
        setTranscript((event?.user_transcript as string) || "");
        setUserSpeaking(false);
        setIsProcessing(true);
      } else if (msg.type === "agent_response") {
        const event = msg.agent_response_event as Record<string, unknown>;
        setTranscript((event?.agent_response as string) || "");
        setIsProcessing(false);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      setIsConnecting(false);
      setIsProcessing(false);
      toast({
        title: "Connection Error",
        description: "Could not connect to voice assistant. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get token from edge function
      const { data, error } = await supabase.functions.invoke(
        "elevenlabs-conversation-token"
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.token) {
        throw new Error("No token received");
      }

      // Start the conversation with WebRTC
      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setIsConnecting(false);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use the voice assistant.",
        variant: "destructive",
      });
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleToggle = () => {
    // When connected, user should just speak (no need to press again).
    // Closing the widget (X) ends the session.
    if (conversation.status === "connected") {
      toast({
        title: "Μίλα τώρα",
        description: "Όσο γράφει 'Ακούει', μιλάς χωρίς να πατήσεις κάτι.",
      });
      return;
    }

    if (!isConnecting) startConversation();
  };

  // When you stop talking, show a clear "processing" state while we wait for the agent turn.
  useEffect(() => {
    if (conversation.status !== "connected") return;
    if (userSpeaking) return;
    if (conversation.isSpeaking) return;

    const t = window.setTimeout(() => {
      setIsProcessing(true);
    }, 900);

    return () => window.clearTimeout(t);
  }, [conversation.status, userSpeaking, conversation.isSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversation.status === "connected") {
        conversation.endSession();
      }
    };
  }, [conversation]);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full shadow-xl",
          "bg-gradient-to-br from-accent via-primary to-accent",
          "hover:shadow-[0_0_30px_rgba(0,178,169,0.6)]",
          "transition-all duration-300 hover:scale-110",
          "border-2 border-white/20",
          className
        )}
        size="icon"
      >
        <div className="relative">
          <Headphones className="h-6 w-6 text-white" />
        </div>
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-24 right-4 z-50 w-80 rounded-2xl shadow-2xl",
        "bg-card border border-border overflow-hidden",
        "animate-in slide-in-from-bottom-4 duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary to-accent text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            <span className="font-semibold">AI Tour Guide</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => {
              stopConversation();
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-white/80 mt-1">
          Ask me anything about Crete transfers & tours!
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-sm">
          {conversation.status === "connected" ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  userSpeaking ? "bg-blue-400" : 
                  conversation.isSpeaking ? "bg-accent" : 
                  isProcessing ? "bg-amber-400" : "bg-emerald-400"
                )} />
                <span className={cn(
                  "relative inline-flex rounded-full h-3 w-3",
                  userSpeaking ? "bg-blue-500" : 
                  conversation.isSpeaking ? "bg-accent" : 
                  isProcessing ? "bg-amber-500" : "bg-emerald-500"
                )} />
              </span>
              <span className={cn(
                "font-medium",
                userSpeaking ? "text-blue-600" : 
                conversation.isSpeaking ? "text-accent" : 
                isProcessing ? "text-amber-600" : "text-emerald-600"
              )}>
                {userSpeaking ? "Μιλάς τώρα… (κάνε παύση για να απαντήσει)" :
                 conversation.isSpeaking ? "Ο ξεναγός απαντάει…" :
                 isProcessing ? "Επεξεργάζεται…" : "Ακούει — μίλα τώρα"}
              </span>
            </>
          ) : isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Connecting...</span>
            </>
          ) : (
            <span className="text-muted-foreground">Tap the mic to start</span>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="p-3 rounded-lg bg-muted/50 text-sm text-foreground min-h-[60px]">
            {transcript}
          </div>
        )}

        {/* Mic Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleToggle}
            disabled={isConnecting}
            className={cn(
              "h-16 w-16 rounded-full transition-all duration-300",
              conversation.status === "connected"
                ? userSpeaking 
                  ? "bg-blue-500 hover:bg-blue-600 animate-pulse" 
                  : "bg-red-500 hover:bg-red-600"
                : "bg-primary hover:bg-primary/90"
            )}
            size="icon"
          >
            {isConnecting ? (
              <Loader2 className="h-7 w-7 animate-spin text-white" />
            ) : conversation.status === "connected" ? (
              <Mic className="h-7 w-7 text-white" />
            ) : (
              <Mic className="h-7 w-7 text-white" />
            )}
          </Button>
        </div>

        {/* Speaking Indicator */}
        {conversation.status === "connected" && (userSpeaking || conversation.isSpeaking) && (
          <div className="flex justify-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 rounded-full animate-pulse",
                  userSpeaking ? "bg-blue-500" : "bg-accent"
                )}
                style={{
                  height: `${Math.random() * 24 + 8}px`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        )}

        {/* Hints */}
        {conversation.status !== "connected" && (
          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>Try asking:</p>
            <p className="italic">"What tours do you offer?"</p>
            <p className="italic">"How much is a transfer to Elafonisi?"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceGuide;
