import { useEffect, useState } from "react";

type Profile = {
  id: string;
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
  url: string | null;
  char: string | null;
};

type Post = {
  id: string;
  user: unknown[];
  timestamp: number;
  slackUrl: string;
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
  )
    .then((resp) => resp.json())
    .catch((err) => console.error(err));
  const user = userJSON as User;
  return user;
};

const getPosts = async (username: string): Promise<Post[]> => {
  return await getUser(username).then((user) => user.posts);
};

// takes a string and returns a jsx element, with links formatted as <a> tags
const formatText = (text: string) => {
  const regex = new RegExp(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/gi
  );
  const matches = text.matchAll(regex);
  if (!matches) return text;

  const elements = [];
  let lastIndex = 0;
  for (const match of matches) {
    const [url] = match;
    const index = match.index;
    const before = text.slice(lastIndex, index);
    lastIndex = index + url.length;
    elements.push(<span>{before}</span>);
    elements.push(<a href={url}>{url}</a>);
  }

  elements.push(<span>{text.slice(lastIndex)}</span>);

  return <>{elements}</>;
};

const Scrapbook = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsShouldUpdate, setPostsShouldUpdate] = useState(true);

  useEffect(() => {
    getPosts("UFifty50sh").then((posts) => setPosts(posts));
  }, [postsShouldUpdate]);

  console.log(posts);

  return (
    <div className="layout fixed left-0 z-10 h-full w-full bg-[#141414] bg-fixed text-white selection:bg-zinc-300 selection:text-black">
      <div className="container mx-auto h-full p-4">
        <h1 className="inline-block text-3xl font-bold">
          My Hack Club Scrapbook
        </h1>
        <button
          className="float-none ml-5 w-max rounded-lg bg-[#ec3750] px-4 py-2 text-white"
          onClick={() => setPostsShouldUpdate(true)}
        >
          Reload posts
        </button>

        <div className="mt-4 grid grid-cols-1 gap-4">
          {posts?.map((post) => (
            <div key={post.id} className="rounded-lg bg-[#1e1e1e] p-4">
              <p className="text-sm text-gray-400">
                {new Date(post.postedAt).toUTCString()}
              </p>
              <h2 className="text-xl font-bold">{formatText(post.text)}</h2>
              <p className="text-lg">{post.slackUrl}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scrapbook;
