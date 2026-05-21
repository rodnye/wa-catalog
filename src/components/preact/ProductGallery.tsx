import { useState } from 'preact/hooks';
import BaseImg from '../preact/BaseImg';

interface Props {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const mainSrc = images[activeIndex] || '/images/placeholder.jpg';

  return (
    <div class="space-y-3">
      <div class="rounded-2xl overflow-hidden bg-gray-50 aspect-square">
        <BaseImg
          src={mainSrc}
          alt={productName}
          class="w-full h-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div class="flex gap-2 overflow-x-auto hide-scrollbar">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActiveIndex(i)}
              class={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                i === activeIndex
                  ? 'border-primary-500'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <BaseImg
                src={img}
                alt={`${productName} - ${i + 1}`}
                class="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
