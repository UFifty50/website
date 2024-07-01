import React, { useEffect, useState } from "react";

type Profile = {
  userID: string;
  slackID: string;
  email: string | null;
  emailVerified: boolean;
  username: string;
  streakCount: number;
  maxStreaks: number;
  displayStreak: boolean;
  streaksToggledOff: boolean;
  customDomain: string | null;
  cssURL: string | null;
  website: string | null;
  github: string | null;
  image: string | null;
  fullSlackMember: boolean;
  avatar: string;
  webring: string[];
  newMember: boolean;
  timezoneOffset: number;
  timezone: string;
  pronouns: string | null;
  customAudioURL: string | null;
  lastUsernameUpdateTime: string;
  webhookURL: string | null;
};

type Reaction = {
  name: string;
  usersReacted: string[];
  urlOrChar: string;
};

type Post = {
  id: string;
  user: unknown[];
  timeStamp: number;
  slackURL: string;
  postedAt: string;
  text: string;
  attachments: string[];
  mux: string[];
  reactions: Reaction[];
};

type User = {
  profile: Profile;
  webring: User[];
  posts: Post[];
};

const getUser = async (username: string): Promise<User> => {
  const userJSON = await fetch(
    `https://scrapbook.hackclub.com/api/users/${username}`
  ).then((resp) => resp.json());
  const user = userJSON as User;
  return user;
};

const getPosts = async (username: string): Promise<Post[]> => {
  return await getUser(username).then((user) => user.posts);
};

const Scrapbook: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    getPosts("UFifty50sh").then((posts) => setPosts(posts));
  });

  console.log(posts);

  return (
    <div className="layout min-h-screen w-full bg-[#141414] bg-fixed text-white selection:bg-zinc-300 selection:text-black">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold">My Hack Club Scrapbook</h1>
        <div className="mt-4 grid grid-cols-1 gap-4">
          {posts?.map((post) => (
            <div key={post.id} className="rounded-lg bg-[#1e1e1e] p-4">
              <h2 className="text-xl font-bold">{post.text}</h2>
              <p className="text-sm text-gray-400">{post.postedAt}</p>
              <p className="text-lg">{post.slackURL}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scrapbook;
