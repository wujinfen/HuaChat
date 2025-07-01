import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosService } from "../lib/axios";

import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast";
import { UserPlusIcon, CheckCircleIcon } from "lucide-react";


const SearchFriendsPage = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [outgoingIds, setOutgoingIds] = useState(new Set());

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: async () => {
      const res = await axiosService.get("/users/outgoing-friend-requests");
      return res.data;
    },
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: async (userId) => {
      const res = await axiosService.post(`/users/friend-request/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      toast.success("Friend request sent");
    },
    onError: () => {
      toast.error("There is already a pending friend request to this user");
    },
  });

  const handleSearch = async () => {
    try {
      const response = await axiosService.get("/users/search", {
        params: { query },
      });
      setResults(response.data || []);
    } catch (err) {
      console.error("Search failed", err);
      toast.error("Search failed");
    }
  };

  useEffect(() => {
  if (Array.isArray(outgoingFriendReqs)) {
    setOutgoingIds(new Set(outgoingFriendReqs.map((req) => req.recipient._id)));
  }
}, [outgoingFriendReqs]);


  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search Users</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Enter name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div className="grid gap-4">
        {results.map((user) => {
          const alreadySent = outgoingIds.has(user._id);
          return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
                key={user._id} className="card bg-base-200 p-3 flex flex-row justify-between items-center ">
              <div className="avatar size-16 rounded-full">
                    <img src={user.profilePic} alt={user.fullName} />
              </div>
              <div>
                <p className="font-semibold">{user.fullName}</p>
                <p className="text-sm opacity-70">{user.email}</p>
              </div>
              <button
                className={`btn ${alreadySent ? "btn-disabled" : "btn-outline btn-primary"}`}
                onClick={() => sendRequestMutation(user._id)}
                disabled={alreadySent || isPending}
              >
                {alreadySent ? (
                  <>
                    <CheckCircleIcon className="size-4 mr-2" />
                    Sent
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="size-4 mr-2" />
                    Add Friend
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchFriendsPage;
