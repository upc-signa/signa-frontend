import * as Switch from "@radix-ui/react-switch";

export default function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">{label}</span>
      <Switch.Root
        checked={checked}
        onCheckedChange={onChange}
        className={`
          w-11 h-6 bg-zinc-300 dark:bg-zinc-700 rounded-full relative
          data-[state=checked]:bg-orange-500 transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500
        `}
      >
        <Switch.Thumb
          className={`
            block w-5 h-5 bg-white rounded-full shadow
            transition-transform translate-x-[2px]
            data-[state=checked]:translate-x-[22px]
          `}
        />
      </Switch.Root>
    </div>
  );
}