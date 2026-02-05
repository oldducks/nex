"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Globe, ShoppingCart, Facebook, MessageCircle, 
  Download, ArrowLeft, ExternalLink, QrCode as QrIcon,
  ChevronRight, Info, Package
} from 'lucide-react';
import { QrCodeImage } from '../../../components/QrCode';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images_json: string[];
  interactive_links?: {
    website?: string;
    order_form?: string;
    facebook?: string;
  };
}

interface Catalog {
  id: number;
  title: string;
  description: string;
  layout_config?: any;
  interactive_links?: any;
  pdf_url?: string;
  products: Product[];
}

export default function PublicCatalog() {
  const params = useParams();
  const slug = params.slug as string;
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchCatalog();
  }, [slug]);

  const fetchCatalog = async () => {
    try {
      // Try by slug first, then by ID
      let res = await fetch(`${API_URL}/catalogs/public/${slug}`);
      if (!res.ok) {
        res = await fetch(`${API_URL}/catalogs/view/${slug}`);
      }
      
      if (res.ok) {
        setCatalog(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!catalog) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
        <Package size={40} className="text-gray-600" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Catalog Not Found</h1>
      <p className="text-gray-400 mb-8">ขออภัย ไม่พบหน้าที่คุณต้องการ หรือแคตตาล็อกนี้ถูกระงับการใช้งาน</p>
      <button onClick={() => window.history.back()} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
        กลับหน้าก่อนหน้า
      </button>
    </div>
  );

  const theme = catalog.layout_config || {};
  const primary = theme.primary_color || '#6366F1';
  const lightMode = theme.display_theme === 'light';
  
  const styles = {
    '--primary': primary,
    '--background': lightMode ? '#f4f4f5' : '#050505',
    '--foreground': lightMode ? '#18181b' : '#ffffff',
    '--card': lightMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 15, 15, 0.8)',
    fontFamily: theme.font_family ? `"${theme.font_family}", sans-serif` : 'inherit',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen transition-colors duration-500" style={styles}>
      <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <h1 className="text-xl font-black tracking-tight uppercase">{catalog.title}</h1>
            <div className="flex items-center gap-3">
              {catalog.pdf_url && (
                <a 
                  href={catalog.pdf_url} 
                  target="_blank"
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Download size={20} />
                </a>
              )}
              <div className="hidden md:block">
                 <CatalogLinks links={catalog.interactive_links} />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* Welcome Section */}
          <div className="mb-16 text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
              {catalog.description || 'Welcome to our digital collection'}
            </h2>
            <p className="text-gray-500 max-w-2xl text-lg leading-relaxed">
              เลือกชมสินค้าที่คุณสนใจ และคลิกเพื่อดูรายละเอียดเชิงลึก หรือสั่งซื้อผ่านลิงก์ได้ทันที
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {catalog.products.map((product) => (
              <div 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="group relative bg-[var(--card)] border border-white/5 rounded-[32px] overflow-hidden hover:border-primary/30 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-primary/5"
              >
                {/* Image */}
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img 
                    src={product.images_json?.[0] || 'https://via.placeholder.com/400x500'} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  
                  {/* Badge */}
                  <div className="absolute bottom-6 right-6 px-4 py-2 bg-primary text-white font-black rounded-full shadow-lg">
                    ฿{product.price.toLocaleString()}
                  </div>
                </div>

                {/* Content Overlay/Bar */}
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 md:line-clamp-3 mb-6">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">View Details</span>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Footer Links (Mobile) */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 bg-[var(--background)]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">
           <CatalogLinks links={catalog.interactive_links} />
        </div>

        {/* Product Modal */}
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </div>
    </div>
  );
}

function CatalogLinks({ links }: { links?: any }) {
  if (!links) return null;
  return (
    <div className="flex items-center gap-3">
      {links.website && (
        <a href={links.website} target="_blank" className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all">
          <Globe size={18} />
        </a>
      )}
      {links.facebook && (
        <a href={links.facebook} target="_blank" className="p-3 bg-blue-600/10 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
          <Facebook size={18} />
        </a>
      )}
      {links.order_form && (
        <a href={links.order_form} target="_blank" className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
          <ShoppingCart size={18} />
        </a>
      )}
    </div>
  );
}

function ProductModal({ product, onClose }: { product: Product, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-[#101010] border border-white/10 rounded-[40px] w-full max-w-4xl relative z-10 overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-500">
        <button onClick={onClose} className="absolute top-6 right-6 z-20 w-12 h-12 bg-black/50 hover:bg-black rounded-full flex items-center justify-center text-white transition-colors border border-white/10">
          <ArrowLeft size={24} />
        </button>

        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Gallery Sidebar/Image */}
          <div className="md:w-1/2 p-4 md:p-8">
            <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-black">
              <img src={product.images_json?.[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info Section */}
          <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto">
            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tighter">{product.name}</h2>
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-lg mb-6">
                ฿{product.price.toLocaleString()}
              </div>
              <p className="text-gray-400 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>

            {/* Interactive Links for Product */}
            <div className="space-y-4">
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Info size={14} /> Actions & Links
               </h4>
               
               <div className="grid grid-cols-1 gap-3">
                 {product.interactive_links?.order_form && (
                   <a 
                    href={product.interactive_links.order_form} 
                    target="_blank"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group"
                   >
                     Order Now <ShoppingCart size={20} className="group-hover:translate-x-1 transition-transform" />
                   </a>
                 )}

                 <div className="grid grid-cols-2 gap-3">
                    {product.interactive_links?.website && (
                      <a href={product.interactive_links.website} target="_blank" className="bg-white/5 hover:bg-white/10 py-5 rounded-2xl flex items-center justify-center gap-2 transition-all">
                        <Globe size={18} /> Website
                      </a>
                    )}
                    {product.interactive_links?.facebook && (
                      <a href={product.interactive_links.facebook} target="_blank" className="bg-white/5 hover:bg-white/10 py-5 rounded-2xl flex items-center justify-center gap-2 transition-all">
                        <Facebook size={18} /> Facebook
                      </a>
                    )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
