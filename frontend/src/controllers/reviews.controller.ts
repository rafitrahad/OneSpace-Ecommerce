import { api } from '@/lib/api';
import { Review, ReviewSummary } from '@/models/types';
import { ReviewInput } from '@/models/schemas';

export async function getReviews(productId: string) {
  const { data } = await api.get<Review[]>(`/products/${productId}/reviews`);
  return data;
}

export async function getReviewSummary(productId: string) {
  const { data } = await api.get<ReviewSummary>(`/products/${productId}/reviews/summary`);
  return data;
}

export async function createReview(productId: string, input: ReviewInput) {
  const { data } = await api.post<Review>(`/products/${productId}/reviews`, input);
  return data;
}

export async function deleteReview(productId: string, reviewId: string) {
  const { data } = await api.delete(`/products/${productId}/reviews/${reviewId}`);
  return data;
}
