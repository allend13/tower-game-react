const enemyTypes = [
  {
    type: 'Normal',
    circleColor: 'bg-yellow-500',
    hp: 100,
    speed: 80,
    armor: 0,
    bounty: 10
  },
  {
    type: 'Fast',
    circleColor: 'bg-orange-500',
    hp: 60,
    speed: 140,
    armor: 0,
    bounty: 15
  },
  {
    type: 'Tank',
    circleColor: 'bg-purple-500',
    hp: 300,
    speed: 50,
    armor: 5,
    bounty: 25
  },
  {
    type: 'Flying',
    circleColor: 'bg-cyan-500',
    hp: 80,
    speed: 100,
    armor: 0,
    bounty: 20
  }
];

export function MobileGameInfo() {
  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      {enemyTypes.map((enemy) => {
        return (
          <div key={enemy.type} className="flex items-start gap-2 mt-[0px] mr-[0px] mb-[0px] ml-[8px]">
            <div className={`w-3 h-3 ${enemy.circleColor} rounded-full flex-shrink-0 mt-0.5`}></div>
            <div className="flex-1">
              <span className="text-foreground block mb-1 text-sm font-normal">{enemy.type}</span>
              <div className="text-muted-foreground text-xs">
                <div className="grid grid-cols-[auto_1fr] gap-x-1 gap-y-0.5">
                  <span>HP:</span><span>{enemy.hp}</span>
                  {enemy.type === 'Tank' ? (
                    <>
                      <span>Armor:</span><span>{enemy.armor}</span>
                    </>
                  ) : enemy.type === 'Flying' ? (
                    <>
                      <span>Special:</span><span>Immune</span>
                    </>
                  ) : (
                    <>
                      <span>Gold:</span><span>{enemy.bounty}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}