// layout.tsx
import type { Metadata } from 'next';
import { Poppins , Prompt} from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils'; 
 
import React from 'react'; 
 

const font = Poppins({
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Gk Photography and films',
  description: 'Gk Photography and films build by ms dev',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 
 return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(font.className) } >
  
           <div className='bg-[#0b0b0b]'>
           {children}
           </div>
        
    
      </body>
    </html>
  );
}
