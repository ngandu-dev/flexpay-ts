import { beforeEach, describe, expect, it } from "vitest";

import { Environment } from "../environment";

describe("Environment enum and helper", () => {
  let dev: Environment;
  let prod: Environment;

  beforeEach(() => {
    dev = new Environment("dev");
    prod = new Environment("prod");
  });

  it("should return correct card payment URL", () => {
    expect(prod.getCardPaymentUrl()).toBe("https://cardpayment.flexpay.cd/v1.1/pay");
    expect(dev.getCardPaymentUrl()).toBe("https://beta-cardpayment.flexpay.cd/v1.1/pay");
  });

  it("should return correct mobile payment URL", () => {
    expect(prod.getMobilePaymentUrl()).toBe(
      "https://backend.flexpay.cd/api/rest/v1/paymentService",
    );
    expect(dev.getMobilePaymentUrl()).toBe(
      "https://beta-backend.flexpay.cd/api/rest/v1/paymentService",
    );
  });

  it("should return correct payout URL", () => {
    expect(prod.getPayoutUrl()).toBe(
      "https://backend.flexpay.cd/api/rest/v1/merchantPayOutService",
    );
    expect(dev.getPayoutUrl()).toBe(
      "https://beta-backend.flexpay.cd/api/rest/v1/merchantPayOutService",
    );
  });

  it("should return correct check status URL", () => {
    expect(prod.getCheckStatusUrl("123456")).toBe(
      "https://backend.flexpay.cd/api/rest/v1/check/123456",
    );
    expect(dev.getCheckStatusUrl("123456")).toBe(
      "https://beta-backend.flexpay.cd/api/rest/v1/check/123456",
    );
  });

  it("uses custom versioned prefixes and removes trailing slashes", () => {
    const local = new Environment("prod", {
      apiBaseUrl: " http://localhost:8080/proxy/api/rest/v1/// ",
      cardBaseUrl: "http://[::1]:8080/proxy/v1.1/",
    });
    expect(local.getMobilePaymentUrl()).toBe(
      "http://localhost:8080/proxy/api/rest/v1/paymentService",
    );
    expect(local.getPayoutUrl()).toBe(
      "http://localhost:8080/proxy/api/rest/v1/merchantPayOutService",
    );
    expect(local.getCheckStatusUrl("order/with spaces?x=#")).toBe(
      "http://localhost:8080/proxy/api/rest/v1/check/order%2Fwith%20spaces%3Fx%3D%23",
    );
    expect(local.getCardPaymentUrl()).toBe("http://[::1]:8080/proxy/v1.1/pay");
  });

  it.each(["dev", "prod"] as const)("keeps independent %s defaults", (env) => {
    const defaults = new Environment(env);
    const apiOnly = new Environment(env, { apiBaseUrl: "http://localhost:8080/api/rest/v1" });
    expect(apiOnly.getCardPaymentUrl()).toBe(defaults.getCardPaymentUrl());
    const cardOnly = new Environment(env, { cardBaseUrl: "http://localhost:8080/v1.1" });
    expect(cardOnly.getMobilePaymentUrl()).toBe(defaults.getMobilePaymentUrl());
    expect(cardOnly.getPayoutUrl()).toBe(defaults.getPayoutUrl());
    expect(cardOnly.getCheckStatusUrl("123")).toBe(defaults.getCheckStatusUrl("123"));
  });

  it.each([
    "",
    " ",
    "/relative",
    "localhost:8080",
    "http:localhost",
    "ftp://localhost/api",
    "http://localhost:invalid",
    "http://user:password@localhost/api",
    "http://localhost/api?token=1",
    "http://localhost/api#fragment",
    "http://localhost/api?",
    "http://localhost/api#",
    "http://localhost/\\path",
  ])("rejects invalid base URL %j for either service", (value) => {
    expect(() => new Environment("dev", { apiBaseUrl: value })).toThrow("Base URLs");
    expect(() => new Environment("dev", { cardBaseUrl: value })).toThrow("Base URLs");
  });
});
