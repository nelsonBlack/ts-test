import { httpGet } from "./mock-http-interface";

type TSuccess = {
  "Arnie Quote": string;
};
type TFailure = {
  FAILURE: string;
};

type TResult = TSuccess | TFailure;

type TResponseBody = {
  message: string;
};

export const getArnieQuotes = async (urls: string[]): Promise<TResult[]> => {
  const result = await Promise.all(
    urls.map((url) => new Request(url).makeHttpRequest())
  );
  console.table(result);
  return result;
};

class Request {
  url: string;
  constructor(url: string) {
    this.url = url;
  }

  async makeHttpRequest(): Promise<TResult> {
    const res = await httpGet(this.url);
    if (!(res && res.body && res.status)) {
      throw new Error("Got Invalid response");
    }

    const body = this.parseBodyResponse(res.body);

    if (this.getResult[res.status]) {
      return this.getResult[res.status](body);
    }
    throw new Error(
      `Unknown error with status ${res.status} and body ${res.body}`
    );
  }

  getResult: Record<number, (body: TResponseBody) => TResult> = {
    200: this.getSuccess,
    500: this.getFailed,
  };

  getSuccess(body: TResponseBody): TSuccess {
    return {
      "Arnie Quote": body.message,
    };
  }

  getFailed(body: TResponseBody): TFailure {
    return {
      FAILURE: body.message,
    };
  }

  parseBodyResponse(response: string): TResponseBody {
    let body: TResponseBody;
    try {
      body = JSON.parse(response) as TResponseBody;
    } catch (err: any) {
      throw new Error(`Error when making request ${JSON.stringify(err)}`);
    }
    return body;
  }
}
