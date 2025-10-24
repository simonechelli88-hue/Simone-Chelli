import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InstallPrompt() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Mostra il prompt solo se non è stato chiuso prima
    const hasSeenPrompt = localStorage.getItem("install-prompt-dismissed");
    if (!hasSeenPrompt) {
      // Mostra dopo 2 secondi
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("install-prompt-dismissed", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">📱 Installa RAPPORTINI EURO EL</DialogTitle>
          <DialogDescription className="text-base">
            Scarica l'applicazione sul tuo dispositivo per un accesso più rapido
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ios" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ios">iPhone/iPad</TabsTrigger>
            <TabsTrigger value="android">Android</TabsTrigger>
            <TabsTrigger value="desktop">PC/Mac</TabsTrigger>
          </TabsList>

          {/* iOS */}
          <TabsContent value="ios" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">📱 iPhone e iPad (Safari)</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold min-w-6">1.</span>
                  <span>Apri questo sito con <strong>Safari</strong> (non Chrome o altri browser)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold min-w-6">2.</span>
                  <span>Tocca l'icona <strong>Condividi</strong> nella barra in basso (quadrato con freccia verso l'alto)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold min-w-6">3.</span>
                  <span>Scorri verso il basso e tocca <strong>"Aggiungi a Home"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold min-w-6">4.</span>
                  <span>Tocca <strong>"Aggiungi"</strong> in alto a destra</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold min-w-6">5.</span>
                  <span>L'icona dell'app apparirà sulla schermata Home! ✅</span>
                </li>
              </ol>
            </div>
          </TabsContent>

          {/* Android */}
          <TabsContent value="android" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">📱 Smartphone Android (Chrome)</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold min-w-6">1.</span>
                  <span>Apri questo sito con <strong>Google Chrome</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold min-w-6">2.</span>
                  <span>Tocca il menu <strong>⋮</strong> (tre puntini) in alto a destra</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold min-w-6">3.</span>
                  <span>Seleziona <strong>"Aggiungi a schermata Home"</strong> o <strong>"Installa app"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold min-w-6">4.</span>
                  <span>Conferma toccando <strong>"Aggiungi"</strong> o <strong>"Installa"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold min-w-6">5.</span>
                  <span>L'icona dell'app apparirà sulla schermata Home! ✅</span>
                </li>
              </ol>
            </div>
          </TabsContent>

          {/* Desktop */}
          <TabsContent value="desktop" className="space-y-4">
            <div className="space-y-4">
              {/* Windows */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">💻 Windows (Chrome/Edge)</h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="font-bold min-w-6">1.</span>
                    <span>Apri questo sito con <strong>Google Chrome</strong> o <strong>Microsoft Edge</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold min-w-6">2.</span>
                    <span>Clicca sull'icona <strong>⊕</strong> (più) nella barra degli indirizzi oppure sul menu <strong>⋮</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold min-w-6">3.</span>
                    <span>Seleziona <strong>"Installa RAPPORTINI EURO EL"</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold min-w-6">4.</span>
                    <span>Clicca <strong>"Installa"</strong> nella finestra di conferma</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold min-w-6">5.</span>
                    <span>L'app si aprirà come applicazione desktop! ✅</span>
                  </li>
                </ol>
              </div>

              {/* Mac */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-lg">🍎 Mac (Chrome/Safari)</h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="font-bold min-w-6">1.</span>
                    <span>Apri questo sito con <strong>Google Chrome</strong> o <strong>Safari</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold min-w-6">2.</span>
                    <span><strong>Chrome:</strong> Clicca sull'icona <strong>⊕</strong> nella barra degli indirizzi</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold min-w-6"></span>
                    <span><strong>Safari:</strong> Vai su File → Aggiungi al Dock</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold min-w-6">3.</span>
                    <span>Conferma l'installazione</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold min-w-6">4.</span>
                    <span>L'app apparirà nel Dock o nelle Applicazioni! ✅</span>
                  </li>
                </ol>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            💡 Una volta installata, l'app funzionerà come un'applicazione nativa!
          </p>
          <Button onClick={handleClose} data-testid="button-dismiss-install">
            Ho capito
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
