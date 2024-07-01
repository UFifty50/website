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

const fetchOrDecodeURIComponent = (reaction: Reaction) => {
  if (reaction.char) {
    return reaction.char;
  }

  return (
    <div className="mt-4 flex items-center space-x-2">
      <a href={"https://scrapbook.hackclub.com/r/" + reaction.name}>
        <img
          src={reaction.url ?? ""}
          alt={reaction.name}
          className="size-8 rounded-3xl"
          style={{
            backgroundColor: "#151613",
            transition: "background-color 0.125s ease-in-out;",
          }}
        />
      </a>
      <p></p>
    </div>
  );
};

const Scrapbook = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsShouldUpdate, setPostsShouldUpdate] = useState(true);

  useEffect(() => {
    const refetchUser = async () => {
      const fetchedUser = await getUser("UFifty50sh");
      setUser(fetchedUser);
    };

    const fetchAndSetPosts = async () => {
      const fetchedPosts = await getPosts("UFifty50sh");
      let updatedPosts = fetchedPosts;

      // Calculate how many empty posts are needed to make the total a multiple of 3
      const emptyPostsCount = (2 - (updatedPosts.length % 2)) % 2;
      const emptyPosts = Array.from({ length: emptyPostsCount }, (_, i) => ({
        id: `empty-${i}`,
        user: [],
        timestamp: Date.now(),
        slackUrl: "",
        postedAt: new Date(0).toISOString(),
        text: "There is no post!",
        attachments: [
          "https://i.kym-cdn.com/entries/icons/facebook/000/012/777/tumblr_lp63ykUGJy1qfzq7j.jpg",
        ],
        mux: [],
        reactions: [],
      }));

      updatedPosts = [...updatedPosts, ...emptyPosts];
      setPosts(updatedPosts);
    };

    refetchUser();
    fetchAndSetPosts();
  }, [postsShouldUpdate]);

  return (
    <div className="layout fixed left-0 z-10 size-full bg-[#141414] bg-fixed text-white selection:bg-zinc-300 selection:text-black">
      <div className="container mx-auto mt-5 h-full p-4">
        <div className="mb-3 mt-6">
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

        <div className="mb-7 flex items-center space-x-1">
          <p className="text-sm">Current streak:</p>
          <p className="text-lg font-bold">{user?.profile.streakCount}</p>
          <p className="text-2xl">|</p>
          <p className="text-sm">Max streak:</p>
          <p className="text-lg font-bold">{user?.profile.maxStreaks}</p>
        </div>

        <div className="mt-4 grid h-auto grid-cols-2 gap-4">
          {posts?.map((post) => {
            const numAttachments = post.attachments.length;
            let gridTemplate = "grid-cols-1 grid-rows-1";
            let cssClasses = "single-image";

            if (numAttachments == 2) {
              gridTemplate = "grid-cols-2 grid-rows-1";
              cssClasses = "double-image";
            } else if (numAttachments == 3) {
              gridTemplate = "grid-cols-2 grid-rows-2";
              cssClasses = "triple-image";
            } else if (numAttachments > 3) {
              gridTemplate = "grid-cols-2 grid-rows-2";
              cssClasses = "quadruple-image";
            }

            return (
              <div key={post.id} className="rounded-lg bg-[#1e1e1e] p-4">
                <p className="text-sm text-gray-400">
                  {new Date(post.postedAt).toUTCString()}
                </p>
                <h2>{formatText(post.text)}</h2>

                <div
                  className={`${gridTemplate} ${cssClasses} mt-3 grid gap-3`}
                >
                  {post.attachments.map((attachment, i) => (
                    <div
                      key={attachment + i}
                      className={`relative overflow-hidden rounded-lg ${numAttachments == 3 && i == 0 ? "col-span-1 row-span-1 size-full" : ""}`}
                      style={{
                        paddingBottom:
                          numAttachments <= 2
                            ? "0"
                            : numAttachments * 10 + 10 + "%",
                        height: numAttachments <= 2 ? "auto" : "0",
                      }}
                    >
                      <img
                        src={attachment}
                        alt="attachment"
                        className={`${
                          numAttachments == 1
                            ? "h-auto w-full"
                            : "inset-0 size-full object-none"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* reactions */}
                <div className="flex items-center space-x-2">
                  {post.reactions.map((reaction) => (
                    <div key={reaction.name} className="flex items-center">
                      {fetchOrDecodeURIComponent(reaction)}
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
