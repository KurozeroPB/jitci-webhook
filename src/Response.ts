interface IResponse {
    statusCode: number;
    statusMessage: string;
    message: string;
}

class CResponse implements IResponse {
    public statusCode: number;
    public statusMessage: string;
    public message: string;

    public constructor(response: IResponse) {
        this.statusCode = response.statusCode;
        this.statusMessage = response.statusMessage;
        this.message = response.message;
    }
}

export function Response(response: IResponse) {
    return new CResponse(response);
}

export default Response;