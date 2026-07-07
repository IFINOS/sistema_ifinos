export default function format_name(nickname, max = 15) {
  if (!nickname) return "...";

  const firstName = nickname.split(" ")[0];

  return firstName.length > max ? firstName.slice(0, max) + "…" : firstName;
}