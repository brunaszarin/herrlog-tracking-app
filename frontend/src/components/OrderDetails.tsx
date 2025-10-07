import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function OrderDetails() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Order Details</TabsTrigger>
          <TabsTrigger value="driver">Driver Information</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="customer">Customer ID</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">ORDER ID</p>
              <p className="font-medium">#012345789</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">PRODUCT</p>
              <p className="font-medium">Waist Trainer</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">PRICE</p>
              <p className="font-medium">$70</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ADDRESS</p>
              <p className="font-medium">17 Airport Road, GRA...</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="driver" className="mt-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">DRIVER NAME</p>
              <p className="font-medium">John Smith</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">PHONE</p>
              <p className="font-medium">+234 801 234 5678</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">RATING</p>
              <p className="font-medium">4.8 ⭐</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">STATUS</p>
              <p className="font-medium text-green-600">On Route</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="vehicle" className="mt-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">VEHICLE TYPE</p>
              <p className="font-medium">Motorcycle</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">PLATE NUMBER</p>
              <p className="font-medium">ABC-123-DE</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">MODEL</p>
              <p className="font-medium">Honda CBR</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">YEAR</p>
              <p className="font-medium">2022</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="billing" className="mt-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">PAYMENT METHOD</p>
              <p className="font-medium">Credit Card</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">SHIPPING FEE</p>
              <p className="font-medium">$5.00</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">TOTAL</p>
              <p className="font-medium">$75.00</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">STATUS</p>
              <p className="font-medium text-green-600">Paid</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="customer" className="mt-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">CUSTOMER ID</p>
              <p className="font-medium">#CUS789456</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">NAME</p>
              <p className="font-medium">Jane Doe</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">EMAIL</p>
              <p className="font-medium">jane@example.com</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">PHONE</p>
              <p className="font-medium">+234 802 345 6789</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}