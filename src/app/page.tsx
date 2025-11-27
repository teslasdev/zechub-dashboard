"use client";
import MetricCard from "./components/Matrics";
import Chart from "./components/zcash/Chart";
import Layout from "./layouts/Layout";

const page = () => {
  return (
    <Layout>
      <div className="container mx-auto space-y-9 px-4 py-8">
        <div className="flex flex-row justify-between items-center gap-4">
          <div className="">
            <h3 className="text-[28px] plus-jakarta-sans font-bold">
              Zcashg Network Metrics
            </h3>
            <p className="text-[#B7B9BD]">
              Analyze Zcash network metrics and trends
            </p>
          </div>

          <div>
            <span className="button-ui">Shielded Networks</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-5  w-full">
          {/* Metrics Component */}
          <MetricCard
            titleIcon={require("../assets/market_cap.png")}
            title="Market Price (BTC)"
            value="$10,038,232,395"
            change={63}
          />
          <MetricCard
            titleIcon={require("../assets/transparency.png")}
            title="24h Transactions"
            value="15,448"
            change={-20}
          />
          <MetricCard
            titleIcon={require("../assets/market_price.png")}
            title="Market Price (BTC)"
            value="$609.49"
            change={63}
          />
          <MetricCard
            titleIcon={require("../assets/shielded.png")}
            title="Market Price (BTC)"
            value="$10,038,232,395"
            change={63}
          />
          <MetricCard
            titleIcon={require("../assets/market_price_btc.png")}
            title="Market Price (BTC)"
            value="$10,038,232,395"
            change={63}
          />

          <MetricCard
            titleIcon={require("../assets/circulation.png")}
            title="Circulation"
            value="10,038,232,395 ZEC"
            change={63}
          />
          <MetricCard
            titleIcon={require("../assets/blocks.png")}
            title="Blocks"
            value="300,232"
            change={63}
          />
        </div>
        <Chart />
      </div>

      
    </Layout>
  );
};

export default page;
