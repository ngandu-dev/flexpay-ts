export type EnvironmentType = "prod" | "dev";

/** Versioned endpoint prefixes, without the service path (for example, /pay). */
export interface BaseUrls {
  apiBaseUrl?: string;
  cardBaseUrl?: string;
}

export class Environment {
  private readonly apiBaseUrl: string | undefined;
  private readonly cardBaseUrl: string | undefined;

  constructor(
    public readonly value: EnvironmentType,
    baseUrls: BaseUrls = {},
  ) {
    this.apiBaseUrl = normalizeBaseUrl(baseUrls.apiBaseUrl);
    this.cardBaseUrl = normalizeBaseUrl(baseUrls.cardBaseUrl);
  }

  getMobilePaymentUrl(): string {
    return `${this.getBaseUrl()}/paymentService`;
  }

  getPayoutUrl(): string {
    return `${this.getBaseUrl()}/merchantPayOutService`;
  }

  getCheckStatusUrl(orderNumber: string): string {
    return `${this.getBaseUrl()}/check/${encodeURIComponent(orderNumber)}`;
  }

  getCardPaymentUrl(): string {
    if (this.cardBaseUrl !== undefined) return `${this.cardBaseUrl}/pay`;
    return this.value === "prod"
      ? "https://cardpayment.flexpay.cd/v1.1/pay"
      : "https://beta-cardpayment.flexpay.cd/v1.1/pay";
  }

  private getBaseUrl(): string {
    if (this.apiBaseUrl !== undefined) return this.apiBaseUrl;
    return this.value === "prod"
      ? "https://backend.flexpay.cd/api/rest/v1"
      : "https://beta-backend.flexpay.cd/api/rest/v1";
  }
}

function normalizeBaseUrl(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const baseUrl = value.trim().replace(/\/+$/, "");
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error(
      "Base URLs must be absolute HTTP(S) URLs without credentials, query, or fragment",
    );
  }
  if (
    !/^https?:\/\//i.test(baseUrl) ||
    !url.hostname ||
    url.username ||
    url.password ||
    baseUrl.includes("?") ||
    baseUrl.includes("#") ||
    baseUrl.includes("\\")
  ) {
    throw new Error(
      "Base URLs must be absolute HTTP(S) URLs without credentials, query, or fragment",
    );
  }
  return baseUrl;
}
