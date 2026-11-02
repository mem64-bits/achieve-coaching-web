export interface ApplyRequestPayload {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    instagram?: string;
    botcheck?: string | boolean;
}

export interface ApplyResponseData {
    success?: boolean;
    error?: string;
    id?: string;
}
