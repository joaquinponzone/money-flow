import Link from "next/link";

interface FooterProps {
  authorLink?: string;
  authorName?: string;
}

export function Footer({ 
  authorLink = "https://github.com/joaquinponzone", 
  authorName = "@joaquinponzone" 
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-6 mt-auto">
      <div className="container flex justify-center items-center text-sm text-muted-foreground">
        <p>
          Hecho con <span className="text-red-500">❤</span> por{" "}
          <Link 
            href={authorLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {authorName}
          </Link>
          {" • "} © {currentYear}
        </p>
      </div>
    </footer>
  );
} 