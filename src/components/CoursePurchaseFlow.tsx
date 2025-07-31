import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { BookingFormFields, formSchema } from '@/components/forms/BookingFormFields';
import { BookingInformation } from '@/components/forms/BookingInformation';
import CourseStripeCheckout from './CourseStripeCheckout';

interface CoursePurchaseFlowProps {
  courseInstance: {
    id: string;
    course_title: string;
    table_name: string;
    price: number;
    discount_price: number;
    max_participants: number | null;
  };
  onClose: () => void;
}

const CoursePurchaseFlow = ({ courseInstance, onClose }: CoursePurchaseFlowProps) => {
  const [currentStep, setCurrentStep] = useState<'form' | 'checkout'>('form');
  const [useDiscountPrice, setUseDiscountPrice] = useState(false);
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      postalCode: '',
      city: '',
    },
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    setFormData(values);
    setCurrentStep('checkout');
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  if (currentStep === 'checkout' && formData) {
    return (
      <CourseStripeCheckout
        courseInstanceId={courseInstance.id}
        courseTitle={courseInstance.course_title}
        courseTableName={courseInstance.table_name}
        price={courseInstance.price}
        discountPrice={courseInstance.discount_price}
        buyerName={formData.name}
        buyerEmail={formData.email}
        buyerPhone={formData.phone}
        buyerAddress={formData.address}
        buyerPostalCode={formData.postalCode}
        buyerCity={formData.city}
        useDiscountPrice={useDiscountPrice}
        onBack={handleBackToForm}
      />
    );
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="max-h-[60vh] lg:max-h-[65vh] px-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pr-3">
            <BookingFormFields form={form} />
            
            <BookingInformation maxParticipants={courseInstance.max_participants} />

            {/* Price selection */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-medium">Välj pris</h3>
              
              <div className="space-y-3">
                <div 
                  className={`p-3 border rounded cursor-pointer ${!useDiscountPrice ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setUseDiscountPrice(false)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Ordinarie pris</div>
                      <div className="text-sm text-gray-600">För alla deltagare</div>
                    </div>
                    <div className="font-bold text-lg">{courseInstance.price} kr</div>
                  </div>
                </div>

                <div 
                  className={`p-3 border rounded cursor-pointer ${useDiscountPrice ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setUseDiscountPrice(true)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Student/pensionär/kursare</div>
                      <div className="text-sm text-gray-600">Rabatterat pris</div>
                    </div>
                    <div className="font-bold text-lg">{courseInstance.discount_price} kr</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-none">
                Avbryt
              </Button>
              <Button type="submit" className="flex-1 rounded-none bg-blue-600 hover:bg-blue-700 text-white">
                Fortsätt till betalning →
              </Button>
            </div>
          </form>
        </Form>
      </ScrollArea>
    </div>
  );
};

export default CoursePurchaseFlow;