
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { SellerForm } from './seller-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseListingDetails } from '@/ai/flows/parse-listing-details-flow';
import { useRouter } from 'next/navigation';

export default function SellPage() {
    const router = useRouter();
    // State for all form fields, lifted up from SellerForm
    const [productName, setProductName] = useState('');
    const [pricePerKg, setPricePerKg] = useState('');
    const [portDetails, setPortDetails] = useState('');
    const [howCaught, setHowCaught] = useState('');
    const [boatDetails, setBoatDetails] = useState<'Ashok Leyland' | 'Persian Boat' | '370-Boat' | ''>('');
    const [brandName, setBrandName] = useState('Malpe Meen');
    const [description, setDescription] = useState('');
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    
    // State for voice recognition
    const [isListening, setIsListening] = useState(false);
    const [isProcessingVoice, startProcessingVoice] = useTransition();
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
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    handleVoiceInput(finalTranscript.trim());
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

    const handleVoiceInput = (text: string) => {
        startProcessingVoice(async () => {
            try {
                const parsedDetails = await parseListingDetails(text);
                if (Object.keys(parsedDetails).length > 0) {
                    setProductName(prev => parsedDetails.productName || prev);
                    setPricePerKg(prev => parsedDetails.pricePerKg ? String(parsedDetails.pricePerKg) : prev);
                    setPortDetails(prev => parsedDetails.portDetails || prev);
                    setHowCaught(prev => parsedDetails.howCaught || prev);
                    setBoatDetails(prev => parsedDetails.boatDetails || prev);
                    setDescription(prev => parsedDetails.description || prev);
                    toast({ title: "Fields Updated", description: "Your details have been updated by voice."});
                } else {
                     toast({ title: "No details understood", description: "Couldn't extract any details from your speech. Please try again."});
                }
            } catch (e: any) {
                console.error("Failed to parse voice input", e);
                let description = "Could not understand the details.";
                if (e.message?.includes('503') || e.message?.includes('overloaded')) {
                    description = "The AI service is temporarily unavailable. Please try again in a moment.";
                }
                toast({ variant: 'destructive', title: "AI Error", description: description});
                // As a fallback, append to description
                setDescription(prev => prev ? `${prev.trim()} ${text}` : text);
            }
        });
    };

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
        <div className="mb-4">
          <Button variant="outline" onClick={() => router.push('/seller/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight font-headline">List Your Fish</CardTitle>
            <CardDescription className="pt-2">
              Fill out the form below to list your catch. Your listing will be visible to buyers immediately.
            </CardDescription>
             <div className="flex justify-end pt-2">
                <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"}
                    onClick={toggleListening}
                    title="Use voice to add description"
                    disabled={isProcessingVoice}
                >
                    {isProcessingVoice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />)}
                    {isProcessingVoice ? 'Processing...' : (isListening ? 'Stop Listening' : 'Add with Voice')}
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SellerForm
                formState={{
                    productName,
                    pricePerKg,
                    portDetails,
                    howCaught,
                    boatDetails,
                    brandName,
                    description,
                    mediaUrls,
                }}
                setFormState={{
                    setProductName,
                    setPricePerKg,
                    setPortDetails,
                    setHowCaught,
                    setBoatDetails,
                    setBrandName,
                    setDescription,
                    setMediaUrls,
                }}
             />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
