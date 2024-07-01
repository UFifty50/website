import { useEffect, useState } from "react";
import { Marked, Renderer, unescape } from "@ts-stack/markdown";
import { Interweave } from "interweave";

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

class MyRenderer extends Renderer {
  // Overriding parent method.
  override link(href: string, title: string, text: string) {
    if (this.options.sanitize) {
      let prot;
      try {
        prot = decodeURIComponent(unescape(href))
          .replace(/[^\w:]/g, "")
          .toLowerCase();
      } catch (e) {
        return text;
      }
      if (
        prot.startsWith("javascript:") ||
        prot.startsWith("vbscript:") ||
        prot.startsWith("data:")
      ) {
        return text;
      }
    }
    let out = '<a href="' + href + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out +=
      'class="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline"';
    out += ">" + text + "</a>";
    return out;
  }
}

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

// takes a string and returns a jsx element, with markdown formatting
const formatText = (text: string) => {
  Marked.setOptions({ renderer: new MyRenderer() });
  return <Interweave content={Marked.parse(text)} />;
};

const Scrapbook = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsShouldUpdate, setPostsShouldUpdate] = useState(true);

  useEffect(() => {
    const fetchAndSetPosts = async () => {
      const fetchedPosts = await getPosts("UFifty50sh");
      let updatedPosts = fetchedPosts;

      // Calculate how many empty posts are needed to make the total a multiple of 3
      const emptyPostsCount = (3 - (updatedPosts.length % 3)) % 3;
      const emptyPosts = Array.from({ length: emptyPostsCount }, (_, i) => ({
        id: `empty-${i}`,
        user: [],
        timestamp: Date.now(),
        slackUrl: "",
        postedAt: new Date(0).toISOString(),
        text: "There is no post!",
        attachments: [
          "https://i.kym-cdn.com/entries/icons/facebook/000/012/777/tumblr_lp63ykUGJy1qfzq7j.jpg",
          "https://i.kym-cdn.com/entries/icons/facebook/000/012/777/tumblr_lp63ykUGJy1qfzq7j.jpg",
        ],
        mux: [],
        reactions: [],
      }));

      updatedPosts = [...updatedPosts, ...emptyPosts];
      setPosts(updatedPosts);
    };

    fetchAndSetPosts();
  }, [postsShouldUpdate]);

  return (
    <div className="layout fixed left-0 z-10 size-full bg-[#141414] bg-fixed text-white selection:bg-zinc-300 selection:text-black">
      <div className="container mx-auto mt-5 h-full p-4">
        <div className="mb-10 mt-5">
          <h1 className="inline-block text-3xl font-bold">
            My Hack Club Scrapbook
          </h1>
          <button
            className="float-none ml-5 w-max rounded-lg bg-[#ec3750] px-4 py-2 text-white"
            onClick={() => setPostsShouldUpdate(!postsShouldUpdate)}
          >
            Reload posts
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          {posts?.map((post) => {
            const numAttachments = post.attachments.length;
            let gridTemplate = "grid-cols-1 grid-rows-1";
            if (numAttachments == 2) {
              gridTemplate = "grid-cols-2 grid-rows-1";
            } else if (numAttachments >= 3) {
              gridTemplate = "grid-cols-2 grid-rows-2";
            }

            return (
              <div key={post.id} className="rounded-lg bg-[#1e1e1e] p-4">
                <p className="text-sm text-gray-400">
                  {new Date(post.postedAt).toUTCString()}
                </p>
                <h2>{formatText(post.text)}</h2>

                <div className={`${gridTemplate} mt-3 grid gap-3`}>
                  {post.attachments.map((attachment, i) => (
                    <div
                      key={attachment + i}
                      className={`relative overflow-hidden rounded-lg ${numAttachments == 3 && i == 0 ? "col-span-2 row-span-2" : ""}`}
                      style={{
                        paddingBottom: numAttachments == 1 ? "0" : "50%",
                        height: numAttachments === 1 ? "auto" : "0",
                      }}
                    >
                      <img
                        src={attachment}
                        alt="attachment"
                        className={`size-full ${numAttachments == 1 ? "" : "absolute"} inset-0 object-cover`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Scrapbook;
