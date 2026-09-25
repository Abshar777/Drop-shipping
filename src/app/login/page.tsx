import { cookies } from "next/headers";
import { getSubjectId } from "@/lib/session-store";
import { findUserById } from "@/lib/users";
import { CUSTOMER_COOKIE, CUSTOMER_SESSION_FILE } from "@/lib/auth-constants";
import LoginForm from "@/components/LoginForm";
import AlreadySignedIn from "@/components/AlreadySignedIn";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const userId = await getSubjectId(CUSTOMER_SESSION_FILE, cookieStore.get(CUSTOMER_COOKIE)?.value);
  const user = userId ? await findUserById(userId).catch(() => undefined) : undefined;
  if (user) return <AlreadySignedIn name={user.name} />;
  return <LoginForm />;
}
