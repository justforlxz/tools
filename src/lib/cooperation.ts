import { Axios } from "axios"

export interface CooperationContext {
  appKey: string
  sign: string
  worksheetId: string
}

export interface Root extends CooperationContext {
  rowId: string
  controls: Control[]
  triggerWorkflow: boolean
}

export interface Control {
  controlId: string
  value: string
  valueType?: string;
}

export interface CooperationOptions {
  baseURL: string;
  appKey: string;
  sign: string;
  worksheetId: string;
}

export class Cooperation {
  private options: CooperationOptions;
  private axios: Axios;
  constructor(options: CooperationOptions) {
    this.options = options;
    this.axios = new Axios({
      baseURL: options.baseURL,
    });
  }

  async getRecord(rowId: string): Promise<Root> {
    const result = await this.axios.post<Root>('/api/v2/open/worksheet/getRowByIdPost', {
        ...this.options,
        rowId
    });
    console.log(result)
    return result.data;
  }
}
