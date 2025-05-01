export const SideBar = () => {
  return (
    <div className="w-60 bg-secondary border-r flex flex-col h-full">
      <p className="flex items-center text-3xl p-4 mb-4 border-b h-20">
        Real Kanban
      </p>

      <div className="flex flex-col gap-y-5 px-4">
        <h2 className="text-2xl mb-2">Workspaces</h2>

        <div>
          <p className="text-lg">Development</p>
          <div className="pl-3 mb-2 space-y-1">
            <p>Project Alpha</p>
            <p>Bug Tracking</p>
          </div>
          <button className="pl-3 text-sm opacity-60">+ Add board</button>
        </div>

        <div>
          <p className="text-lg">Marketing</p>
          <div className="pl-3 mb-2 space-y-1">
            <p>Google Ads</p>
          </div>
          <button className="pl-3 text-sm opacity-60">+ Add board</button>
        </div>

        <div>
          <p className="text-lg">Design</p>
          <div className="pl-3 mb-2 space-y-1">
            <p>Website redesign</p>
          </div>
          <button className="pl-3 text-sm opacity-60">+ Add board</button>
        </div>
      </div>
    </div>
  );
};
