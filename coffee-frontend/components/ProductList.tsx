"use client";

import type { Product } from "@/types";

export default function ProductList({
  products, onAdd,
}: { products: Product[]; onAdd: (id: string) => void; }) {
  return (
    <div className="md:col-span-8 mt-4 d-flex flex-column align-items-start p-3 pt-0">
      <h5 className="flex-grow-0"><b>상품 목록</b></h5>
      <ul className="list-group products w-100">
        {products.map(p => (
          <li key={p.id} className="list-group-item d-flex mt-3">
            <div className="col-2"><img className="img-fluid" src={p.imageUrl} alt={p.name} /></div>
            <div className="col">
              <div className="row text-muted">커피콩</div>
              <div className="row">{p.name} ({p.origin})</div>
            </div>
            <div className="col text-center price">{p.price.toLocaleString()}원</div>
            <div className="col text-end action">
              <button className="btn btn-small btn-outline-dark" onClick={() => onAdd(p.id)}>추가</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
