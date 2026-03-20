import { getApiBaseURL } from '@/config/environment';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// ==================== Home Page API Types ====================

export interface HomePageResponse {
  home_page: HomePage;
  sliders: Slider[];
  categories_by_section: CategorySection[];
  latest_ads: Ad[];
  featured_ads: Ad[];
  latest_blogs: BlogPost[];
}

export interface HomePage {
  hero_title: string;
  hero_title_ar: string;
  hero_subtitle: string;
  hero_subtitle_ar: string;
  hero_image: string | null;
  hero_button_text: string;
  hero_button_text_ar: string;
  hero_button_url: string;
  show_why_choose_us: boolean;
  why_choose_us_title: string;
  why_choose_us_title_ar: string;
  why_choose_us_subtitle: string;
  why_choose_us_subtitle_ar: string;
  why_choose_us_features: Feature[];
  show_featured_categories: boolean;
  show_featured_ads: boolean;
  show_statistics: boolean;
  stat1_value: number;
  stat1_title: string;
  stat1_title_ar: string;
  stat1_subtitle: string;
  stat1_subtitle_ar: string;
  stat1_icon: string;
  stat2_value: number;
  stat2_title: string;
  stat2_title_ar: string;
  stat2_subtitle: string;
  stat2_subtitle_ar: string;
  stat2_icon: string;
  stat3_value: number;
  stat3_title: string;
  stat3_title_ar: string;
  stat3_subtitle: string;
  stat3_subtitle_ar: string;
  stat3_icon: string;
  stat4_value: number;
  stat4_title: string;
  stat4_title_ar: string;
  stat4_subtitle: string;
  stat4_subtitle_ar: string;
  stat4_icon: string;
}

export interface Feature {
  id: number;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  icon: string;
  order: number;
  is_active: boolean;
}

export interface Slider {
  id: number;
  title: string;
  title_ar: string;
  subtitle: string;
  subtitle_ar: string;
  description: string;
  description_ar: string;
  image: string;
  button_text: string;
  button_text_ar: string;
  button_url: string;
  country: number | null;
  background_color: string;
  text_color: string;
  is_active: boolean;
  order: number;
}

export interface CategorySection {
  section_type: string;
  section_name: string;
  categories: Category[];
}

export interface Category {
  id: number;
  name: string;
  name_ar: string;
  slug: string;
  slug_ar: string;
  section_type: string;
  parent: number | null;
  description: string;
  icon: string;
  image: string;
  country: number | null;
  countries: number[];
  custom_field_schema: any;
  allow_cart: boolean;
  cart_instructions: string;
  default_reservation_percentage: number;
  min_reservation_amount: string;
  max_reservation_amount: string;
  subcategories: Category[];
  custom_fields: CustomField[];
  subcategories_count?: number;
  ads_count?: number;
}

export interface CustomField {
  id: number;
  name: string;
  label_ar: string;
  label_en: string;
  field_type: string;
  is_required: boolean;
  options: CustomFieldOption[];
}

export interface CustomFieldOption {
  id: number;
  label_ar: string;
  label_en: string;
  value: string;
  order: number;
  is_active: boolean;
}

export interface Ad {
  id: number;
  title: string;
  slug: string;
  category: {
    id: number;
    name: string;
    name_ar: string;
    slug: string;
    slug_ar: string;
    section_type: string;
    icon: string;
    image: string;
    parent: number | null;
    subcategories_count: number;
    ads_count: number;
    allow_cart: boolean;
  };
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_image: string | null;
    verification_status: string;
    average_rating: number;
    is_premium: boolean;
    profile_type: string;
    rank: string;
  };
  price: string;
  is_negotiable: boolean;
  primary_image: string;
  city: string;
  country: number;
  status: string;
  is_highlighted: boolean;
  is_urgent: boolean;
  is_favorited: boolean;
  views_count: number;
  created_at: string;
  expires_at: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  is_active: boolean;
  blogs_count: number;
}

export interface BlogComment {
  id: number;
  blog: number;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_image: string | null;
  };
  body: string;
  created_on: string;
  active: boolean;
  parent: number | null;
  replies: BlogComment[];
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_image: string | null;
    verification_status: string;
    average_rating: number;
    is_premium: boolean;
    profile_type: string;
    rank: string;
  };
  category: BlogCategory | null;
  image: string;
  published_date: string;
  views_count: number;
  likes_count: number;
  is_liked: boolean;
  is_published: boolean;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
  updated_date: string;
  comments: BlogComment[];
  tags: string[];
}

export interface BlogsListResponse {
  results?: BlogPost[];
  count?: number;
  total_pages?: number;
  next?: string | null;
  previous?: string | null;
}

export interface CategoriesListParams {
  section_type?: string;
  parent?: number;
  country?: number;
  search?: string;
}

export interface CategoriesListResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Category[];
}

export interface BlogCategoriesResponse {
  results?: BlogCategory[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface BlogsListParams {
  search?: string;
  category?: number;
  author?: number;
  ordering?: string;
  page?: number;
  tag?: string;
}

export interface AdImage {
  id: number;
  image: string;
  order: number;
}

export interface AdReview {
  id: number;
  user: number;
  reviewer_name: string;
  reviewer_image: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export interface AdDetail extends Ad {
  description: string;
  address: string;
  images: AdImage[];
  is_pinned: boolean;
  updated_at: string;
  reviews: AdReview[];
  custom_fields: Record<string, string>;
  is_cart_enabled: boolean;
  video_url: string | null;
  rating: number;
  rating_count: number;
  primary_image: string;
}

export interface AdsListResponse {
  ads?: Ad[];
  results?: Ad[];
  count?: number;
  total?: number;
  page?: number;
  total_pages?: number;
  next?: string | null;
  previous?: string | null;
}

export interface AdsListParams {
  search?: string;
  category?: number;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  page?: number;
  limit?: number;
  country?: string;
  city?: string;
  extra_params?: Record<string, string>;
}

// ==================== End Home Page API Types ====================

class ApiService {
  private baseUrl = 'https://jsonplaceholder.typicode.com';
  private weatherUrl = 'https://api.open-meteo.com/v1';
  private idrissiMartUrl = getApiBaseURL(); // Use environment-based URL

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getPosts(limit = 10) {
    return this.request<Post[]>(`${this.baseUrl}/posts?_limit=${limit}`);
  }

  async getPost(id: number) {
    return this.request<Post>(`${this.baseUrl}/posts/${id}`);
  }

  async getUsers() {
    return this.request<User[]>(`${this.baseUrl}/users`);
  }

  async getWeather(latitude: number, longitude: number) {
    const url = `${this.weatherUrl}/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,precipitation&timezone=auto`;
    return this.request<WeatherResponse>(url);
  }

  async getPhotos(limit = 20) {
    return this.request<Photo[]>(`${this.baseUrl}/photos?_limit=${limit}`);
  }

  // Idrissimart Home API
  async getHomeData(
    country?: string,
    latest_ads_limit: number = 20,
    featured_ads_limit: number = 20,
    blogs_limit: number = 10
  ) {
    const params = new URLSearchParams();
    if (country) params.append('country', country);
    params.append('latest_ads_limit', latest_ads_limit.toString());
    params.append('featured_ads_limit', featured_ads_limit.toString());
    params.append('blogs_limit', blogs_limit.toString());

    const url = `${this.idrissiMartUrl}/home/?${params.toString()}`;
    return this.request<HomePageResponse>(url);
  }

  // Idrissimart Categories API
  async getCategories(params: CategoriesListParams = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    return this.request<CategoriesListResponse>(`${this.idrissiMartUrl}/categories/?${query.toString()}`);
  }

  async getRootCategories(section_type?: string) {
    const query = new URLSearchParams();
    if (section_type) query.append('section_type', section_type);
    return this.request<Category[]>(`${this.idrissiMartUrl}/categories/root_categories/?${query.toString()}`);
  }

  async getCategoryDetail(id: number) {
    return this.request<Category>(`${this.idrissiMartUrl}/categories/${id}/`);
  }

  // Idrissimart Blogs API
  async getBlogPosts(params: BlogsListParams = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    return this.request<BlogsListResponse>(`${this.idrissiMartUrl}/blogs/?${query.toString()}`);
  }

  async getBlogCategories() {
    return this.request<BlogCategoriesResponse>(`${this.idrissiMartUrl}/blog-categories/`);
  }

  async getBlogPost(id: number) {
    return this.request<BlogPostDetail>(`${this.idrissiMartUrl}/blogs/${id}/`);
  }

  async likeBlogPost(id: number) {
    return this.request<{ status: 'liked' | 'unliked'; likes_count: number }>(
      `${this.idrissiMartUrl}/blogs/${id}/like/`,
      { method: 'POST' },
    );
  }

  async addBlogComment(id: number, body: string, parent?: number | null) {
    return this.request<BlogComment>(
      `${this.idrissiMartUrl}/blogs/${id}/comment/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, parent: parent ?? null }),
      },
    );
  }

  // Idrissimart Ads API
  async getAds(params: AdsListParams = {}) {
    const query = new URLSearchParams();
    const { extra_params, ...rest } = params;
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    if (extra_params) {
      Object.entries(extra_params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    return this.request<AdsListResponse>(`${this.idrissiMartUrl}/ads/?${query.toString()}`);
  }

  async getCustomFieldsByCategory(categoryId: number) {
    return this.request<CustomField[]>(`${this.idrissiMartUrl}/custom-fields/by_category/?category_id=${categoryId}`);
  }

  async getAdDetail(id: number) {
    return this.request<AdDetail>(`${this.idrissiMartUrl}/ads/${id}/`);
  }
}

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
  company: {
    name: string;
  };
}

export interface WeatherResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
  };
  hourly: {
    temperature_2m: number[];
    precipitation: number[];
    time: string[];
  };
}

export interface Photo {
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

export const api = new ApiService();