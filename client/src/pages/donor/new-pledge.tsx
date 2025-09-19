import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigation } from '@/components/layout/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/auth';
import { ORGAN_TYPES, DONATION_TYPES } from '@shared/schema';
import { ArrowLeft, Gift } from 'lucide-react';

const pledgeSchema = z.object({
  organType: z.enum(['heart', 'kidney', 'liver', 'lung', 'pancreas', 'cornea']),
  donationType: z.enum(['living', 'posthumous']),
  medicalNotes: z.string().optional(),
});

type PledgeFormData = z.infer<typeof pledgeSchema>;

export default function NewPledge() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PledgeFormData>({
    resolver: zodResolver(pledgeSchema),
    defaultValues: {
      organType: undefined,
      donationType: 'posthumous',
      medicalNotes: '',
    },
  });

  const createPledgeMutation = useMutation({
    mutationFn: async (data: PledgeFormData) => {
      const response = await apiRequest('POST', '/api/organ-pledges', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organ-pledges'] });
      toast({
        title: "Pledge created successfully",
        description: "Your organ pledge has been registered. Thank you for your generous commitment.",
      });
      setLocation('/donor');
    },
    onError: (error: any) => {
      toast({
        title: "Pledge failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PledgeFormData) => {
    createPledgeMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="new-pledge-page">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/donor')}
                className="mr-4"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">New Organ Pledge</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Pledge Organ Donation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-newPledge">
                    <FormField
                      control={form.control}
                      name="organType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organ Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-organType">
                                <SelectValue placeholder="Select organ to pledge" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ORGAN_TYPES.map((organ) => (
                                <SelectItem key={organ} value={organ}>
                                  {organ.charAt(0).toUpperCase() + organ.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="donationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Donation Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-donationType">
                                <SelectValue placeholder="Select donation type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DONATION_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)} Donation
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="medicalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any relevant medical information, health conditions, or notes..."
                              className="min-h-[100px]"
                              {...field}
                              data-testid="textarea-medicalNotes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium text-foreground mb-2">Important Information</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Your pledge will be reviewed by medical professionals</li>
                        <li>• Living donations require additional medical evaluations</li>
                        <li>• You can modify or withdraw your pledge at any time</li>
                        <li>• All pledges are kept confidential and secure</li>
                      </ul>
                    </div>

                    <div className="flex space-x-4">
                      <Button 
                        type="submit" 
                        disabled={createPledgeMutation.isPending}
                        className="flex-1"
                        data-testid="button-submit"
                      >
                        {createPledgeMutation.isPending ? 'Creating Pledge...' : 'Create Pledge'}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setLocation('/donor')}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}