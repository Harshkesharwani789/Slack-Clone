import { format } from "date-fns";

interface ChannelHeroProps {
  name: string;
  creationTime: number;
}

export const ChannelHero = ({ name, creationTime }: ChannelHeroProps) => {
  return (
    <div className="mt-[88px] mx-5 mb-4">
      <p className="text-2xl font-bold flex items-center mb-2 text-gray-900 dark:text-gray-100">
        # {name}
      </p>
      <p className="font-normal text-slate-800 dark:text-gray-200 mb-4">
        This channel was created on {format(creationTime, "MMMM do, yyyy")}. This is the very beginning of the <strong>{name}</strong> channel.
      </p>
    </div>
  );
};
