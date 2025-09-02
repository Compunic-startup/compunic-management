import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export function TopBarComponent() {
  return (
    <>
      <nav className="flex justify-between bg-gradient-to-br from-[#FF416C]/90 to-[#FF4B2B]/90 backdrop-blur-md shadow-lg text-white px-6 py-4 rounded-b-lg">
        <div className="flex m-auto">
          <div>
            <h2>Avenue365</h2>
          </div>
          <div className="ms-5">Billing Address</div>
        </div>
        <div className="p-inputgroup  flex-1 ms-10 me-10">
          <InputText placeholder="Search" />
          <Button icon="pi pi-search" className="" />
        </div>
        <div className="m-auto me-8">Account detail</div>
        <div className="m-auto">Cart</div>
      </nav>
    </>
  );
}
