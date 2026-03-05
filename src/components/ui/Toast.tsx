import { CheckCircle2, XCircle } from 'lucide-react';


interface ToastProps {
    message: string;
    visible: boolean;
    /** @default 'success' */
    variant?: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, visible, variant = 'success' }) => {
    const isError = variant === 'error';
    return (
        <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[150] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'
                }`}
        >
            <div className={`bg-white border-b-4 ${isError ? 'border-red-500' : 'border-green-500'} px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3`}>
                {isError
                    ? <XCircle className="text-red-500" size={20} />
                    : <CheckCircle2 className="text-green-500" size={20} />}
                <span className="font-brand font-bold text-gray-800 text-sm whitespace-nowrap">{message}</span>
            </div>
        </div>
    );
};
