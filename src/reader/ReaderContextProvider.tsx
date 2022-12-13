import { createNanoEvents, Emitter } from "nanoevents";
import { createContext, JSXElement, useContext } from "solid-js";

export interface ReaderEvents {
    next: () => void;
    prev: () => void;
}

export interface ReaderContextValue {
    events: Emitter<ReaderEvents>;
}

const ReaderContext = createContext<ReaderContextValue>();

export function ReaderContextProvider(props: { children?: JSXElement }) {
    const events = createNanoEvents<ReaderEvents>();
    const context: ReaderContextValue = { events };

    return (
        <ReaderContext.Provider value={context}>
            {props.children}
        </ReaderContext.Provider>
    );
}

export function useReaderContext() {
    return useContext(ReaderContext);
}
