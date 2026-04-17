import { forwardRef, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  defaultOpen?: string;
}

const FAQAccordion = forwardRef<HTMLDivElement, FAQAccordionProps>(({ items, defaultOpen }, ref) => {
  const [openItem, setOpenItem] = useState<string | undefined>(defaultOpen || 'item-0');

  return (
    <div ref={ref}>
      <Accordion
        type="single"
        collapsible
        value={openItem}
        onValueChange={setOpenItem}
        className="space-y-4"
      >
        {items.map((item, index) => (
          <div 
            key={index}
            className="group relative"
          >
            {/* Active Highlight Glow */}
            <div className={`absolute inset-x-4 -inset-y-4 bg-accent/10 rounded-[2.5rem] blur-2xl transition-all duration-500 ${openItem === `item-${index}` ? 'opacity-100' : 'opacity-0'}`} />
            
            <AccordionItem
              value={`item-${index}`}
              className={`
                relative px-6 sm:px-10 border rounded-[2.5rem] transition-all duration-500 overflow-hidden mb-4
                ${openItem === `item-${index}` 
                  ? 'bg-white/95 dark:bg-slate-900 border-accent/30 shadow-2xl shadow-accent/5 -translate-y-1 py-4' 
                  : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 py-2'
                }
                hover:border-accent/20 hover:shadow-xl
              `}
            >
              <div className="flex items-center gap-6">
                <span className={`text-sm font-black transition-colors duration-500 ${openItem === `item-${index}` ? 'text-accent' : 'text-slate-300'}`} aria-hidden="true">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <AccordionTrigger className={`text-left font-bold text-xl md:text-2xl text-primary hover:no-underline py-6 transition-all duration-500 ${openItem === `item-${index}` ? 'text-accent gap-4' : 'gap-2'}`}>
                  {item.question}
                </AccordionTrigger>
              </div>
              <AccordionContent className="text-muted-foreground pb-10 leading-relaxed text-lg md:text-xl pl-12 lg:pl-16 font-medium">
                <div className="max-w-4xl opacity-90">
                  {item.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          </div>
        ))}
      </Accordion>
    </div>
  );
});

FAQAccordion.displayName = 'FAQAccordion';

export default FAQAccordion;
