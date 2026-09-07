import { ProductDetailView } from '@/views/ProductDetailView';

export default function Page({ params }: { params: { id: string } }) {
  return <ProductDetailView id={params.id} />;
}
