import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import AuctionCard from "../components/auction/AuctionCard";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("myBids");
  const [bids, setBids] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Auction Form State
  const [newAuction, setNewAuction] = useState({
    title: "",
    description: "",
    category: "Electronics",
    startingBid: "",
    bidIncrement: "",
    endTime: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [auctionsRes, bidsRes] = await Promise.all([
        api.get("/auctions/my-auctions"),
        api.get("/bids/my-bids"),
      ]);

      if (auctionsRes.data.success) {
        setAuctions(auctionsRes.data.auctions || []);
      }
      if (bidsRes.data.success) {
        setBids(bidsRes.data.bids || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      return toast.error("Please select an image to upload");
    }

    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("title", newAuction.title);
      formData.append("description", newAuction.description);
      formData.append("category", newAuction.category);
      formData.append("startingBid", Number(newAuction.startingBid));
      formData.append("bidIncrement", Number(newAuction.bidIncrement));
      formData.append("endTime", newAuction.endTime);
      formData.append("startTime", new Date().toISOString()); // default start time to now
      formData.append("images", imageFile);

      const res = await api.post("/auctions/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast.success("Auction created successfully!");
        setNewAuction({
          title: "",
          description: "",
          category: "Electronics",
          startingBid: "",
          bidIncrement: "",
          endTime: "",
        });
        setImageFile(null);
        setActiveTab("myAuctions");
        // Fetch updated auction list
        await fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create auction");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-6 mb-10 glass-card p-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-4xl font-bold text-white mb-4 md:mb-0 shadow-[0_0_20px_rgba(192,64,235,0.4)]">
          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-display font-bold text-white">
            {user?.name}
          </h1>
          <p className="text-gray-400">{user?.email}</p>
          <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
            <span className="bg-dark-900 border border-dark-border px-3 py-1 rounded-full text-xs font-medium text-gray-300">
              Member since 2026
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="glass-card p-4 flex flex-row lg:flex-col gap-2 overflow-x-auto">
            {["myBids", "myAuctions", "create"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 rounded-lg font-medium text-left transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                    : "text-gray-400 hover:text-white hover:bg-dark-850 border border-transparent"
                }`}
              >
                {tab === "myBids" && "My Active Bids"}
                {tab === "myAuctions" && "My Auctions"}
                {tab === "create" && "+ Create Auction"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:w-3/4">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6 md:p-8"
          >
            {activeTab === "create" && (
              <div>
                <h2 className="text-2xl font-display font-bold mb-6 text-white border-b border-dark-border pb-4">
                  Create New Auction
                </h2>
                <form onSubmit={handleCreateAuction} className="space-y-5">
                  <Input
                    label="Product Title"
                    required
                    value={newAuction.title}
                    onChange={(e) =>
                      setNewAuction({ ...newAuction, title: e.target.value })
                    }
                  />

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">
                      Description
                    </label>
                    <textarea
                      className="w-full bg-dark-850 border border-dark-border text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[100px]"
                      required
                      value={newAuction.description}
                      onChange={(e) =>
                        setNewAuction({
                          ...newAuction,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-300">
                        Category
                      </label>
                      <select
                        className="w-full bg-dark-850 border border-dark-border text-white rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500/50"
                        value={newAuction.category}
                        onChange={(e) =>
                          setNewAuction({
                            ...newAuction,
                            category: e.target.value,
                          })
                        }
                      >
                        <option>Electronics</option>
                        <option>Art</option>
                        <option>Collectibles</option>
                        <option>Fashion</option>
                      </select>
                    </div>
                    <Input
                      label="End Time"
                      type="datetime-local"
                      required
                      value={newAuction.endTime}
                      onChange={(e) =>
                        setNewAuction({
                          ...newAuction,
                          endTime: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      label="Starting Bid ($)"
                      type="number"
                      min="1"
                      required
                      value={newAuction.startingBid}
                      onChange={(e) =>
                        setNewAuction({
                          ...newAuction,
                          startingBid: e.target.value,
                        })
                      }
                    />
                    <Input
                      label="Bid Increment ($)"
                      type="number"
                      min="1"
                      required
                      value={newAuction.bidIncrement}
                      onChange={(e) =>
                        setNewAuction({
                          ...newAuction,
                          bidIncrement: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300">
                      Product Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="w-full bg-dark-850 border border-dark-border text-gray-400 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500/20 file:text-primary-400 hover:file:bg-primary-500/30 transition-all cursor-pointer"
                      required
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={creating}
                    >
                      Publish Auction
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {(activeTab === "myBids" || activeTab === "myAuctions") && (
              <div>
                <h2 className="text-2xl font-display font-bold mb-6 text-white border-b border-dark-border pb-4">
                  {activeTab === "myBids" ? "My Active Bids" : "My Auctions"}
                </h2>

                {activeTab === "myAuctions" &&
                  (auctions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {auctions.map((auction) => {
                        const isEnded =
                          auction.status === "ended" ||
                          new Date(auction.endTime) < new Date();
                        return (
                          <div key={auction._id} className="flex flex-col">
                            <AuctionCard auction={auction} />
                            <button
                                onClick={async () => {
                                  if (
                                    !window.confirm(
                                      `Delete "${auction.title}"? This cannot be undone.`
                                    )
                                  )
                                    return;
                                  try {
                                    const res = await api.delete(
                                      `/auctions/${auction._id}`
                                    );
                                    if (res.data.success) {
                                      toast.success("Auction deleted!");
                                      setAuctions((prev) =>
                                        prev.filter(
                                          (a) => a._id !== auction._id
                                        )
                                      );
                                    }
                                  } catch (err) {
                                    toast.error(
                                      err.response?.data?.message ||
                                        "Failed to delete"
                                    );
                                  }
                                }}
                                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete Auction
                              </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 glass-card">
                      <p className="text-gray-400 mb-4">
                        You haven't created any auctions yet.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("create")}
                      >
                        Create your first auction
                      </Button>
                    </div>
                  ))}

                {activeTab === "myBids" &&
                  (bids.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {/* Extract unique auctions from bids */}
                      {Array.from(
                        new Map(
                          bids
                            .filter((b) => b.auction)
                            .map((b) => [b.auction._id, b.auction]),
                        ).values(),
                      ).map((auction) => (
                        <AuctionCard key={auction._id} auction={auction} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 glass-card">
                      <p className="text-gray-400">
                        You don't have any active bids right now.
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
