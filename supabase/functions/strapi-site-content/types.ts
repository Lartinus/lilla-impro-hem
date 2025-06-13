
export interface StrapiResponse {
  data: any;
  meta?: any;
}

export interface ContentRequestBody {
  type: string;
}

export interface StrapiConfig {
  token: string;
  url: string;
}
