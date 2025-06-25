"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

const uspList = [
	{
		title: "Direct aan de slag",
		description: "Start eenvoudig met het maken en delen van werkbladen.",
	},
	{
		title: "Voor docenten & leerlingen",
		description:
			"Leswise is ontworpen voor het onderwijs, met focus op gebruiksgemak.",
	},
	{
		title: "Veilig & privacyvriendelijk",
		description: "Jouw data is veilig en wordt niet gedeeld met derden.",
	},
];

const illustrationUrl =
	"https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&q=80";

const LandingPage: React.FC = () => {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && user) {
			// Hier kun je eventueel user metadata/rol ophalen
			// Voor nu: redirect standaard naar /dashboard
			router.replace("/dashboard");
		}
	}, [user, loading, router]);

	return (
		<main
			style={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				background: "linear-gradient(to bottom, #fff, #e0e7ff)",
				padding: "2rem 1rem",
			}}
		>
			<header style={{ marginBottom: 40, textAlign: "center" }}>
				<h1
					style={{
						fontSize: "2.5rem",
						fontWeight: 700,
						marginBottom: 16,
						color: "#1e3a8a",
					}}
				>
					Welkom bij Leswise
				</h1>
				<p
					style={{
						fontSize: "1.25rem",
						color: "#2563eb",
						maxWidth: 600,
						margin: "0 auto",
					}}
				>
					De slimme tool voor het maken, delen en beoordelen van digitale
					werkbladen in het onderwijs.
				</p>
			</header>
			<section
				style={{
					display: "flex",
					flexDirection: "row",
					gap: 40,
					marginBottom: 40,
					width: "100%",
					maxWidth: 1100,
					alignItems: "center",
					flexWrap: "wrap",
				}}
			>
				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						gap: 24,
					}}
				>
					{uspList.map((usp) => (
						<div
							key={usp.title}
							style={{
								background: "#fff",
								borderRadius: 16,
								boxShadow: "0 2px 12px #e0e7ff",
								padding: 24,
								border: "1px solid #dbeafe",
							}}
						>
							<h2
								style={{
									fontSize: "1.5rem",
									fontWeight: 600,
									color: "#1e40af",
									marginBottom: 8,
								}}
							>
								{usp.title}
							</h2>
							<p
								style={{
									color: "#2563eb",
									fontSize: "1rem",
								}}
							>
								{usp.description}
							</p>
						</div>
					))}
				</div>
				<div
					style={{
						flex: 1,
						display: "flex",
						justifyContent: "center",
					}}
				>
					<img
						src={illustrationUrl}
						alt="Leswise illustratie"
						width={350}
						height={260}
						style={{
							borderRadius: 12,
							boxShadow: "0 4px 24px #c7d2fe",
							border: "1px solid #dbeafe",
							objectFit: "cover",
						}}
					/>
				</div>
			</section>
			<div
				style={{
					display: "flex",
					gap: 32,
					marginTop: 16,
				}}
			>
				<Link
					href="/login"
					style={{
						padding: "18px 40px",
						background: "#2563eb",
						color: "#fff",
						borderRadius: 12,
						fontWeight: 600,
						fontSize: "1.15rem",
						boxShadow: "0 2px 8px #dbeafe",
						textDecoration: "none",
						transition: "background 0.2s",
					}}
				>
					Aanmelden
				</Link>
				<Link
					href="/register"
					style={{
						padding: "18px 40px",
						background: "#fff",
						color: "#2563eb",
						border: "2px solid #2563eb",
						borderRadius: 12,
						fontWeight: 600,
						fontSize: "1.15rem",
						boxShadow: "0 2px 8px #dbeafe",
						textDecoration: "none",
						transition: "background 0.2s",
					}}
				>
					Account aanmaken
				</Link>
			</div>
		</main>
	);
};

export default LandingPage;