import { useState } from "react";

// Tabs component - simple implementation
export const Tabs = ({ children, defaultValue, value, onValueChange }: any) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value);

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className="tabs-container">
      {children({ activeTab, setActiveTab: handleTabChange })}
    </div>
  );
};

export const TabsList = ({ children }: any) => (
  <div className="border-b border-[#100F27] px-[22px] py-6 h-16 flex gap-6 justify-between items-center">
    <div className="space-x-4">{children}</div>
    <div className="flex gap-2 items-center">
      <span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M3.50334 5.83335C2.85856 5.83335 2.30789 5.60585 1.85134 5.15085C1.39478 4.69585 1.1665 4.14616 1.1665 3.50177C1.1665 2.84883 1.394 2.2966 1.849 1.8451C2.30323 1.39283 2.85292 1.16669 3.49809 1.16669C4.15103 1.16669 4.70325 1.39185 5.15475 1.84219C5.60703 2.29291 5.83317 2.84435 5.83317 3.49652C5.83317 4.1413 5.608 4.69196 5.15767 5.14852C4.70695 5.60508 4.1555 5.83335 3.50334 5.83335ZM3.49984 5.25002C3.99567 5.25002 4.41139 5.07988 4.747 4.7396C5.08261 4.39933 5.25023 3.98613 5.24984 3.50002C5.24984 3.00419 5.08223 2.58866 4.747 2.25344C4.41178 1.91821 3.99606 1.75041 3.49984 1.75002C3.01373 1.75002 2.60053 1.91783 2.26025 2.25344C1.91998 2.58905 1.74984 3.00458 1.74984 3.50002C1.74984 3.98613 1.91998 4.39933 2.26025 4.7396C2.60053 5.07988 3.01373 5.25002 3.49984 5.25002ZM8.74984 12.8334V8.75002H12.8332V12.8334H8.74984ZM9.33317 12.25H12.2498V9.33335H9.33317V12.25ZM10.0478 4.36802L4.36842 10.0334C4.41703 10.1201 4.45631 10.2146 4.48625 10.3169C4.51659 10.4187 4.53175 10.5247 4.53175 10.6348C4.53175 10.9587 4.42034 11.234 4.1975 11.4608C3.97428 11.6879 3.69778 11.8014 3.368 11.8014C3.04445 11.8014 2.76873 11.6879 2.54084 11.4608C2.31295 11.2337 2.19881 10.9579 2.19842 10.6336C2.19842 10.303 2.31198 10.0262 2.53909 9.80294C2.76581 9.57971 3.04114 9.4681 3.36509 9.4681C3.47514 9.4681 3.58131 9.48327 3.68359 9.5136C3.78548 9.54355 3.87978 9.58283 3.9665 9.63144L9.63184 3.9521C9.58323 3.86538 9.54375 3.77321 9.51342 3.6756C9.48309 3.57838 9.46792 3.47494 9.46792 3.36527C9.46792 3.03471 9.58148 2.75763 9.80859 2.53402C10.0357 2.31041 10.3112 2.1986 10.6352 2.1986C10.9657 2.1986 11.2428 2.31021 11.4664 2.53344C11.6896 2.75666 11.8013 3.03316 11.8013 3.36294C11.8013 3.6861 11.6894 3.96183 11.4658 4.1901C11.2422 4.41838 10.9651 4.53233 10.6346 4.53194C10.5253 4.53194 10.4219 4.51677 10.3243 4.48644C10.2266 4.45649 10.1345 4.41663 10.0478 4.36802Z"
            fill="white"
          />
        </svg>
      </span>
      <span>Customize</span>
    </div>
  </div>
);

export const TabsTrigger = ({
  value,
  children,
  activeTab,
  setActiveTab,
}: any) => (
  <button
    className={`px-3 py-2 text-[16px] cursor-pointer inline-flex shrink-0 font-medium rounded-md transition-colors ${
      activeTab === value
        ? "bg-background text-[#ffffff] shadow-sm"
        : "text-[#969696] hover:text-[#969696]"
    }`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, children, activeTab }: any) => (
  <div className={activeTab === value ? "block px-[25px] py-6" : "hidden"}>{children}</div>
);
