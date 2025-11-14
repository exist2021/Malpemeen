
'use client';

import { useState, useRef, useEffect } from 'react';
import { SellerForm } from './seller-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SellPage() {
    const [description, setDescription] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const { toast } = useToast();

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setDescription(prev => prev ? `${prev.trim()} ${finalTranscript.trim()}` : finalTranscript.trim());
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                toast({
                    variant: 'destructive',
                    title: 'Voice Error',
                    description: `An error occurred during speech recognition: ${event.error}`,
                });
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, [toast]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast({
                variant: 'destructive',
                title: 'Not Supported',
                description: 'Your browser does not support voice recognition.',
            });
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsListening(!isListening);
    };


  return (
    <>
      <Header />
      <div className="container mx-auto max-w-2xl py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight font-headline">List Your Fish</CardTitle>
            <CardDescription className="pt-2">
              Fill out the form below to list your catch. Your listing will be visible to customers immediately.
            </CardDescription>
             <div className="flex justify-end pt-2">
                <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"}
                    onClick={toggleListening}
                    title="Use voice to add description"
                >
                    {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                    {isListening ? 'Listening...' : 'Add with Voice'}
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SellerForm description={description} setDescription={setDescription} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
