import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Ruler, ArrowLeftRight } from 'lucide-react';

type Unit = 'inches' | 'cm';

const SIZES = {
  tshirts: {
    label: 'T-SHIRTS',
    headers: ['SIZE', 'CHEST', 'LENGTH', 'SLEEVE'],
    rows: [
      { size: 'S', inches: ['34-36', '28', '15.5'], cm: ['86-91', '71', '39'] },
      { size: 'M', inches: ['38-40', '29', '17'], cm: ['96-101', '73', '43'] },
      { size: 'L', inches: ['42-44', '30', '18.5'], cm: ['106-111', '76', '47'] },
      { size: 'XL', inches: ['46-48', '31', '20'], cm: ['116-121', '78', '50'] },
      { size: '2XL', inches: ['50-52', '32', '21.5'], cm: ['127-132', '81', '54'] },
      { size: '3XL', inches: ['54-56', '33', '23'], cm: ['137-142', '83', '58'] },
    ]
  },
  hoodies: {
    label: 'HOODIES',
    headers: ['SIZE', 'CHEST', 'LENGTH', 'SLEEVE'],
    rows: [
      { size: 'S', inches: ['38-40', '27', '33.5'], cm: ['96-101', '68', '85'] },
      { size: 'M', inches: ['41-43', '28', '34.5'], cm: ['104-109', '71', '87'] },
      { size: 'L', inches: ['44-46', '29', '35.5'], cm: ['111-116', '73', '90'] },
      { size: 'XL', inches: ['47-49', '30', '36.5'], cm: ['119-124', '76', '92'] },
      { size: '2XL', inches: ['50-53', '31', '37.5'], cm: ['127-134', '78', '95'] },
    ]
  },
  sweatshirts: {
    label: 'SWEATSHIRTS',
    headers: ['SIZE', 'CHEST', 'LENGTH', 'SLEEVE'],
    rows: [
      { size: 'S', inches: ['36-38', '27', '32'], cm: ['91-96', '68', '81'] },
      { size: 'M', inches: ['39-41', '28', '33'], cm: ['99-104', '71', '83'] },
      { size: 'L', inches: ['42-44', '29', '34'], cm: ['106-111', '73', '86'] },
      { size: 'XL', inches: ['45-47', '30', '35'], cm: ['114-119', '76', '88'] },
      { size: '2XL', inches: ['48-51', '31', '36'], cm: ['121-129', '78', '91'] },
    ]
  }
};

export default function SizeGuide() {
  const [unit, setUnit] = useState<Unit>('inches');

  return (
    <div className="min-h-screen bg-black text-white py-32 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-accent font-mono text-sm mb-6 block tracking-[0.5em]">[ FIT_MATRIX ]</span>
          <h1 className="text-7xl md:text-9xl font-display uppercase mb-6 leading-[0.8] tracking-tighter">
            SIZE<span className="outline-text">GUIDE</span>
          </h1>
          <p className="font-mono text-sm uppercase tracking-wider text-white/40 mb-16">
            FIND YOUR PERFECT FIT. ALL MEASUREMENTS ARE BODY MEASUREMENTS.
          </p>
        </motion.div>

        {/* Unit Toggle */}
        <div className="flex items-center gap-4 mb-12 border-4 border-white p-2 w-fit shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <button
            onClick={() => setUnit('inches')}
            className={`px-6 py-3 font-mono text-sm uppercase tracking-wider transition-all ${unit === 'inches' ? 'bg-accent text-black' : 'text-white/40 hover:text-white'}`}
          >
            INCHES
          </button>
          <ArrowLeftRight size={16} className="text-white/20" />
          <button
            onClick={() => setUnit('cm')}
            className={`px-6 py-3 font-mono text-sm uppercase tracking-wider transition-all ${unit === 'cm' ? 'bg-accent text-black' : 'text-white/40 hover:text-white'}`}
          >
            CM
          </button>
        </div>

        {/* Size Charts */}
        <div className="space-y-16">
          {Object.values(SIZES).map((category) => (
            <motion.div
              key={category.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
            >
              <h2 className="font-display text-3xl uppercase mb-8 tracking-widest text-accent">{category.label}</h2>
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-sm uppercase tracking-wider">
                  <thead>
                    <tr className="border-b-4 border-accent">
                      {category.headers.map(h => (
                        <th key={h} className="text-left py-4 text-accent">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {category.rows.map(row => (
                      <tr key={row.size} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 font-bold text-white">{row.size}</td>
                        {(unit === 'inches' ? row.inches : row.cm).map((val, i) => (
                          <td key={i} className="py-4 text-white/60">{val}{unit === 'cm' ? ' cm' : '"'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How to Measure */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 border-4 border-accent p-8 shadow-[8px_8px_0px_0px_rgba(0,255,102,1)]"
        >
          <h2 className="font-display text-3xl uppercase mb-6 tracking-widest flex items-center gap-4">
            <Ruler size={28} className="text-accent" /> HOW TO MEASURE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-mono text-sm uppercase tracking-wider text-white/60">
            <div>
              <h4 className="text-white font-bold mb-2">CHEST</h4>
              <p>MEASURE AROUND THE FULLEST PART OF YOUR CHEST, KEEPING THE TAPE LEVEL.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-2">LENGTH</h4>
              <p>MEASURE FROM THE HIGHEST POINT OF THE SHOULDER TO THE BOTTOM HEM.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-2">SLEEVE</h4>
              <p>MEASURE FROM THE CENTER BACK NECK TO THE WRIST WITH ARM SLIGHTLY BENT.</p>
            </div>
          </div>
        </motion.div>

        <p className="mt-12 font-mono text-xs text-white/20 uppercase tracking-wider text-center">
          WHEN IN DOUBT, SIZE UP. OUR GARMENTS ARE DESIGNED FOR A RELAXED FIT.
        </p>
      </div>
    </div>
  );
}
