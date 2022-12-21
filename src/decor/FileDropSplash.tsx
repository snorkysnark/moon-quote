export default function FileDropSplash(props: { message: string }) {
    return (
        <div class="w-full h-full p-4">
            <div class="w-full h-full border-dotted border-4 border-gray-500 flex items-center justify-center">
                <pre>
                    <p class="text-center text-2xl">{props.message}</p>
                </pre>
            </div>
        </div>
    );
}
