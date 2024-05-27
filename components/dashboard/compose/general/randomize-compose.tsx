import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/utils/api";
import { AlertBlock } from "@/components/shared/alert-block";
import { Dices } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
	composeId: string;
}

export const RandomizeCompose = ({ composeId }: Props) => {
	const utils = api.useUtils();
	const [compose, setCompose] = useState<string>("");
	const [isOpen, setIsOpen] = useState(false);
	const { mutateAsync, error, isError } =
		api.compose.randomizeCompose.useMutation();

	const onSubmit = async () => {
		await mutateAsync({
			composeId,
		})
			.then(async (data) => {
				await utils.project.all.invalidate();
				setCompose(data);
				toast.success("Compose randomized");
			})
			.catch(() => {
				toast.error("Error to randomize the compose");
			});
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild onClick={() => onSubmit()}>
				<Button className="max-lg:w-full" variant="outline">
					<Dices className="h-4 w-4" />
					Randomize Compose
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-6xl max-h-[50rem] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Randomize Compose (Experimental)</DialogTitle>
					<DialogDescription>
						Use this in case you want to deploy the same compose file and you
						have conflicts with some property like volumes, networks, etc, this
						will add a prefix to the property to avoid conflicts
					</DialogDescription>
				</DialogHeader>
				{isError && <AlertBlock type="error">{error?.message}</AlertBlock>}

				<div className="p-4 bg-secondary rounded-lg">
					<pre>
						<code className="language-yaml">{compose}</code>
					</pre>
				</div>
			</DialogContent>
		</Dialog>
	);
};