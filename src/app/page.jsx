// Utils
import { redirect } from "next/navigation";

// tecnicamente essa é a página index, mas no nosso caso tem que ser redirecionado para o home, pois o home é o nosso index
export default function Page() {
  redirect("/home");
}
