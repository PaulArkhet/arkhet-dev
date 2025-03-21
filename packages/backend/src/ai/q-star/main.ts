interface IReasoning {
  reward: number;
}

// - `reasoning` is the list (chain) of reasoning steps (or actions) taken so far.
export type MDPState<Problem, Reasoning extends IReasoning> = {
  initial: Problem;
  reasoning: Reasoning[];
};

// A function that gives a reward for a given (terminal) state.
// For instance, it might check ESLint and rendering to return 1 if successful.
export type RewardFunction<Problem, Reasoning extends IReasoning> = (
  state: MDPState<Problem, Reasoning>
) => number | Promise<number>;

// A function that estimates the Q-value (expected future reward)
// for taking a specific action in a given state.
// for our example, we do this through rollout.
export type QHeuristicFunction<
  Problem,
  Reasoning extends IReasoning,
  Action,
> = (
  state: MDPState<Problem, Reasoning>,
  action: Action
) => Promise<number> | number;

// A function that, given the current state, expands this action
export type CandidateGenerator<Problem, Reasoning extends IReasoning> = (
  state: MDPState<Problem, Reasoning>
) => Promise<MDPState<Problem, Reasoning>>;

// A function that applies an action to a state and returns the new state.
export type ApplyAction<Problem, Reasoning extends IReasoning, Action> = (
  state: MDPState<Problem, Reasoning>,
  action: Action
) => Promise<MDPState<Problem, Reasoning>> | MDPState<Problem, Reasoning>;

// A function to aggregate rewards or utility from the initial state to the current state.
// This is our "g" value in A*.
export type Aggregator<Problem, Reasoning extends IReasoning> = (
  state: MDPState<Problem, Reasoning>
) => number;

// A function that checks if a state is terminal (i.e. a final solution).
// For example, it might call rewardFunction(state) and check if it equals 1.
export type TerminalCheck<Problem, Reasoning extends IReasoning> = (
  state: MDPState<Problem, Reasoning>
) => boolean;

/**
 * qStar implements a generic Q* process that uses a best-first search strategy.
 * It continues expanding states until a terminal state is reached (or a maximum number of iterations is hit).
 * This variation implements a rollout based approach to Q value estimation
 */
export async function qStar<Problem, Reasoning extends IReasoning>(params: {
  initialProblem: Problem;
  candidateGenerator: CandidateGenerator<Problem, Reasoning>;
  rewardFunction: RewardFunction<Problem, Reasoning>;
  aggregator: Aggregator<Problem, Reasoning>;
  lambda: number; // importance of h term in  f = g + h
  isTerminal: TerminalCheck<Problem, Reasoning>;
  terminalReward: number;
  maxIterations?: number;
  numAlternatives: number;
  numExplorationSteps: number;
  communicator?: (state: MDPState<Problem, Reasoning>) => void;
}): Promise<MDPState<Problem, Reasoning> | null> {
  const {
    initialProblem,
    candidateGenerator,
    terminalReward,
    aggregator,
    lambda,
    isTerminal,
    maxIterations = 1000,
    numAlternatives,
    numExplorationSteps,
    communicator,
  } = params;

  console.log(
    `qStar: Starting search with maxIterations=${maxIterations}, lambda=${lambda}`
  );

  const initialState: MDPState<Problem, Reasoning> = {
    initial: initialProblem,
    reasoning: [],
  };
  let openList: { state: MDPState<Problem, Reasoning>; f: number }[] = [
    { state: initialState, f: 0 },
  ];
  const visited: { state: MDPState<Problem, Reasoning>; f: number }[] = [];
  let iterations = 0;

  // Main search loop.
  while (iterations < maxIterations) {
    iterations++;
    console.log(
      `Iteration ${iterations}: unvisited set contains ${openList.length} nodes. We've visited ${visited.length} nodes.`
    );

    let newNodes: { state: MDPState<Problem, Reasoning>; f: number }[] = [];
    // for (let i = 0; i < openList.length; i++) {

    const bestFInOpen = openList.reduce((bestState, currentState) => {
      if (currentState.f > bestState.f) return currentState;
      return bestState;
    });

    const bestFInOpenIndex = openList.findIndex(
      (itemInOpen) => itemInOpen === bestFInOpen
    );
    console.log(
      `Picking state with best f value ${bestFInOpen.f}, last action: ${JSON.stringify(bestFInOpen.state.reasoning.at(-1), null, 2)}, length: ${bestFInOpen.state.reasoning.length}`
    );
    const { state } = openList.splice(bestFInOpenIndex, 1)[0];
    console.log(`Adding current state to visited`);
    visited.push(bestFInOpen);
    if (communicator) communicator(state);

    if (isTerminal(state)) {
      console.log(`Terminal state reached at iteration ${iterations}.`);
      return state;
    }

    const g = aggregator(state);
    console.log(`Best state aggregator score (g) = ${g}`);

    console.log(`Expanding open list through rollout...`);

    // Run all alternatives in parallel
    const explorationNodes = await Promise.all(
      Array.from({ length: numAlternatives }, async () => {
        // generate the action
        console.log('generating first action for exploration node');
        const candidateState = await candidateGenerator(state);
        const firstStepReward = candidateState.reasoning.at(-1)!.reward;

        let currentExplorationState = candidateState;
        let aggregatedRolloutReward = 0;

        let totalExplorationSteps = 0;
        // simulate single path rollout for n steps
        for (
          let explorationStepCount = 0;
          explorationStepCount < numExplorationSteps;
          explorationStepCount++
        ) {
          totalExplorationSteps++;
          console.log(`Simulating rollout step ${explorationStepCount}`);
          currentExplorationState = await candidateGenerator(
            currentExplorationState
          );
          aggregatedRolloutReward +=
            currentExplorationState.reasoning.at(-1)!.reward;

          if (isTerminal(currentExplorationState)) {
            console.log(
              `terminal state reached, adding terminal reward of ${terminalReward}...`
            );
            aggregatedRolloutReward += terminalReward;
            break;
          }
        }

        const h =
          firstStepReward + totalExplorationSteps > 0
            ? aggregatedRolloutReward / totalExplorationSteps
            : aggregatedRolloutReward;
        return { state: candidateState, f: g + lambda * h };
      })
    );

    // Add all exploration nodes to the open list.
    newNodes = newNodes.concat(explorationNodes);

    console.log(`adding ${newNodes.length} new nodes to open list.`);
    openList = openList.concat(newNodes);
  }

  console.log(
    `qStar: No terminal state found within ${maxIterations} iterations.`
  );
  return null;
}
