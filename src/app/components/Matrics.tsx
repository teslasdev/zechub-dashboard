"use client";

import Image from "next/image";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  titleIcon?: string;
}

export default function MetricCard({
  title,
  value,
  change,
  titleIcon,
}: MetricCardProps) {
  return (
    <div className="relative group w-full">
      {/* Radiant Border Container */}
      <div className="radiant-ui-border p-px rounded-2xl bg-linear-to-r light:from-white/20 via-transparent to-transparent w-full max-w-[350px] mx-auto">
        <div className="bg-[#050915] w-full h-full rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
          <h3 className="dark:text-gray-400 text-gray-800 text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
            {titleIcon && (
              <Image src={titleIcon} alt={title} width={24} height={24} className="sm:w-[28px] sm:h-[28px]" />
            )}{" "}
            {title}
          </h3>
          <div className="items-baseline justify-between">
            <span className="text-lg sm:text-xl my-2 font-semibold plus-jakarta-sans text-white">{value}</span>
            <div className="flex items-center mt-2 justify-between">
              <div className={`flex ${change >= 0 ? "bg-[#0AA38240]" : "bg-[#C60C0C40]"} w-fit p-1.5 sm:p-2 rounded-full justify-center items-center`}>
                <span
                  className={`text-[10px] sm:text-[12px] ${
                    change >= 0 ? "text-[#0AA382]" : "text-[#C60C0C]"
                  }`}
                >
                  {change >= 0 ? `+${change}%` : `${change}%`}
                </span>
                {change >= 0 ? (
                  <Image
                    src={require("../../assets/up_market.png")}
                    alt="Up Arrow"
                    width={14}
                    height={14}
                    className="sm:w-4 sm:h-4"
                  />
                ) : (
                  <Image
                    src={require("../../assets/down_market.png")}
                    alt="Down Arrow"
                    width={16}
                    height={16}
                  />
                )}
              </div>
              <div className="">
                {change >= 0 ? (
                  <Image
                    src={require("../../assets/market_up.png")}
                    alt={title}
                    width={45.5}
                    height={22}
                  />
                ) : (
                  <Image
                    src={require("../../assets/market_down.png")}
                    alt={title}
                    width={45.5}
                    height={22}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}