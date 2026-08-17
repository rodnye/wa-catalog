import { resolveUrlBase } from '@/utils/helpers';
import type { ImgHTMLAttributes } from 'preact';

type Props = ImgHTMLAttributes & { src: string };

export default function BaseImg({ src, ...props }: Props) {
  return <img src={resolveUrlBase(src)} {...props} />;
}
