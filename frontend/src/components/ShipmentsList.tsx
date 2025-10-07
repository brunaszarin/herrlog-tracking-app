import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Shipment {
  id: string;
  name: string;
  orderId: string;
  address: string;
  price: string;
  image: string;
  selected?: boolean;
}

const shipments: Shipment[] = [
  {
    id: "1",
    name: "Hisense Washing Machine",
    orderId: "#012345789",
    address: "17 Airport Road, Benin City, Nigeria.",
    price: "$120",
    image: "https://images.unsplash.com/photo-1754732693535-7ffb5e1a51d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXNoaW5nJTIwbWFjaGluZSUyMGFwcGxpYW5jZXxlbnwxfHx8fDE3NTk3MzY3Njl8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "2", 
    name: "JBL Clip 4 Bluetooth Speaker",
    orderId: "#012345789",
    address: "17 Airport Road, Benin City, Nigeria.",
    price: "$60",
    image: "https://images.unsplash.com/photo-1608488458196-61cd3a720de8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVldG9vdGglMjBzcGVha2VyJTIwamJsfGVufDF8fHx8MTc1OTc2MjQwM3ww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "3",
    name: "Double Compression Waist Trainer",
    orderId: "#012345789", 
    address: "17 Airport Road, Benin City, Nigeria.",
    price: "$70",
    image: "https://images.unsplash.com/photo-1750698545009-679820502908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YWlzdCUyMHRyYWluZXIlMjBmaXRuZXNzfGVufDF8fHx8MTc1OTc2MjQwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    selected: true
  },
  {
    id: "4",
    name: "20kg Adjustable Dumbell",
    orderId: "#012345789",
    address: "17 Airport Road, Benin City, Nigeria.",
    price: "$200",
    image: "https://images.unsplash.com/photo-1725289571284-98f89d2cbba3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZGp1c3RhYmxlJTIwZHVtYmJlbGwlMjB3ZWlnaHR8ZW58MXx8fHwxNzU5NzYyNDExfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "5",
    name: "Handmade Leather Shoe",
    orderId: "#012345789",
    address: "17 Airport Road, Benin City, Nigeria.",
    price: "$50",
    image: "https://images.unsplash.com/photo-1673201183138-e68d0b47dbe5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwc2hvZXMlMjBoYW5kbWFkZXxlbnwxfHx8fDE3NTk3NjI0MTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "6",
    name: "Flower Vase",
    orderId: "#012345789",
    address: "17 Airport Road, Benin City, Nigeria.",
    price: "$25",
    image: "https://images.unsplash.com/photo-1699436653179-77a8cf6019a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG93ZXIlMjB2YXNlJTIwY2VyYW1pY3xlbnwxfHx8fDE3NTk3NjI0MTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

export function ShipmentsList() {
  return (
    <div className="space-y-3">
      {shipments.map((shipment) => (
        <div 
          key={shipment.id}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            shipment.selected 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <ImageWithFallback 
                src={shipment.image}
                alt={shipment.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{shipment.name}</h3>
              <p className="text-sm text-gray-500">{shipment.orderId}</p>
              <p className="text-sm text-gray-500 truncate">{shipment.address}</p>
            </div>
            
            <div className="flex-shrink-0">
              <p className="font-medium text-gray-900">{shipment.price}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}