import React from 'react';
import { ChevronRight, Plus, Minus } from 'lucide-react';
import { Product } from '../../features/catalog/types';
import { Badge } from './Badge';

interface ProductCardProps {
    product: Product;
    variant?: 'display' | 'action';
    quantity?: number;
    onAdd?: () => void;
    onRemove?: () => void;
    onDetails?: () => void;
}

interface ControlBtnProps {
    icon: React.ElementType;
    onClick?: () => void;
    disabled?: boolean;
}

const ControlBtn: React.FC<ControlBtnProps> = ({ icon: Icon, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="p-2 text-gray-500 hover:text-[#007ACC] disabled:opacity-30 transition-colors"
    >
        <Icon size={18} />
    </button>
);

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    variant = 'display',
    quantity = 0,
    onAdd,
    onRemove,
    onDetails,
}) => {
    const isAction = variant === 'action';

    return (
        <article className="bg-white p-5 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all group border border-transparent hover:border-[#007ACC]/10 relative flex flex-col h-full">
            {product.tag && <Badge text={product.tag} />}

            <div className="aspect-square rounded-[2rem] overflow-hidden mb-4 bg-gray-50 shadow-inner">
                {product.img ? (
                    <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-amber-50">
                        <span className="text-5xl">🍦</span>
                        <span className="text-xs text-gray-400 mt-2 font-medium text-center px-2">
                            {product.name.split(' - ')[0]}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-grow">
                <h3 className="text-lg font-brand font-bold text-gray-800 mb-1 leading-tight">{product.name}</h3>
                {product.description && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{product.description}</p>
                )}
            </div>

            <div className="mt-4">
                {!isAction ? (
                    <button
                        onClick={onDetails}
                        className="w-full flex items-center justify-center gap-2 text-[#007ACC] font-bold text-xs py-3 border-2 border-[#007ACC]/10 rounded-2xl group-hover:bg-[#007ACC] group-hover:text-white transition-all"
                    >
                        Ver Sabores <ChevronRight size={14} />
                    </button>
                ) : (
                    <div className="flex items-center justify-between bg-gray-100 rounded-2xl p-1">
                        <ControlBtn icon={Minus} onClick={onRemove} disabled={quantity <= 0} />
                        <span className="font-brand font-bold text-base w-8 text-center">{quantity}</span>
                        <ControlBtn icon={Plus} onClick={onAdd} />
                    </div>
                )}
            </div>
        </article>
    );
};
